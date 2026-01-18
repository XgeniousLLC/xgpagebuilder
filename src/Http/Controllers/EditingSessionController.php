<?php

namespace Xgenious\PageBuilder\Http\Controllers;

use App\Http\Controllers\Controller;
use Xgenious\PageBuilder\Models\PageEditingSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

/**
 * EditingSessionController
 *
 * Manages real-time editing sessions for page builder to prevent conflicts
 * and enable collaborative editing awareness.
 */
class EditingSessionController extends Controller
{
    /**
     * Start a new editing session for a page
     */
    public function startSession(Request $request, int $pageId): JsonResponse
    {
        try {
            $validator = Validator::make([
                'page_id' => $pageId,
                'editing_section' => $request->input('editing_section', 'full_page'),
            ], [
                'page_id' => 'required|integer|exists:pages,id',
                'editing_section' => 'required|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $adminId = Auth::guard('admin')->id();
            $editingSection = $request->input('editing_section', 'full_page');

            // Check if page exists
            $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
            $page = $pageModelClass::findOrFail($pageId);

            // Check for existing active sessions
            $existingSessions = PageEditingSession::getActiveForPage($pageId);

            if ($existingSessions->isNotEmpty()) {
                // Check if current user already has a session
                $currentUserSession = $existingSessions->where('admin_id', $adminId)->first();

                if ($currentUserSession) {
                    // Update existing session
                    $currentUserSession->updateActivity();
                    $currentUserSession->update(['editing_section' => $editingSection]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Existing session updated',
                        'data' => [
                            'session' => $currentUserSession->toSessionInfo(),
                            'current_editors' => $existingSessions->map->toSessionInfo()
                        ]
                    ]);
                }

                // If it's not full_page editing, check for section conflicts
                if ($editingSection !== 'full_page') {
                    $sectionConflicts = $existingSessions->where('editing_section', $editingSection);
                    $fullPageConflicts = $existingSessions->where('editing_section', 'full_page');

                    if ($sectionConflicts->isEmpty() && $fullPageConflicts->isEmpty()) {
                        // No conflicts, can proceed with section editing
                    } else {
                        return response()->json([
                            'success' => false,
                            'code' => 'SECTION_CONFLICT',
                            'message' => 'Section is currently being edited by another user',
                            'data' => [
                                'conflicts' => $sectionConflicts->merge($fullPageConflicts)->map->toSessionInfo(),
                                'current_editors' => $existingSessions->map->toSessionInfo()
                            ]
                        ], 409);
                    }
                } else {
                    // Full page editing conflicts with any other session
                    return response()->json([
                        'success' => false,
                        'code' => 'PAGE_CONFLICT',
                        'message' => 'Page is currently being edited by another user',
                        'data' => [
                            'conflicts' => $existingSessions->map->toSessionInfo(),
                            'current_editors' => $existingSessions->map->toSessionInfo()
                        ]
                    ], 409);
                }
            }

            // Create new session
            $session = PageEditingSession::startSession(
                $pageId,
                $adminId,
                $editingSection,
                [
                    'page_title' => $page->title,
                    'browser' => $request->userAgent(),
                ]
            );

            Log::info('New editing session started', [
                'session_id' => $session->id,
                'page_id' => $pageId,
                'admin_id' => $adminId,
                'section' => $editingSection
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Editing session started successfully',
                'data' => [
                    'session' => $session->toSessionInfo(),
                    'current_editors' => [$session->toSessionInfo()]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to start editing session', [
                'page_id' => $pageId,
                'admin_id' => Auth::guard('admin')->id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to start editing session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send heartbeat to keep session alive and get current editors
     */
    public function heartbeat(Request $request, string $sessionToken): JsonResponse
    {
        try {
            $session = PageEditingSession::findByToken($sessionToken);

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'code' => 'SESSION_NOT_FOUND',
                    'message' => 'Editing session not found or expired'
                ], 404);
            }

            // Verify session belongs to current user
            if ($session->admin_id !== Auth::guard('admin')->id()) {
                return response()->json([
                    'success' => false,
                    'code' => 'UNAUTHORIZED_SESSION',
                    'message' => 'Session does not belong to current user'
                ], 403);
            }

            // Update session activity
            $session->updateActivity();

            // Get all current active editors for this page
            $activeEditors = PageEditingSession::getActiveForPage($session->page_id);

            // Check for conflicts (other users started editing the same section)
            $conflicts = [];
            if ($session->editing_section !== 'full_page') {
                $sectionConflicts = $activeEditors->where('editing_section', $session->editing_section)
                    ->where('admin_id', '!=', $session->admin_id);

                $fullPageConflicts = $activeEditors->where('editing_section', 'full_page')
                    ->where('admin_id', '!=', $session->admin_id);

                $conflicts = $sectionConflicts->merge($fullPageConflicts)->map->toSessionInfo()->toArray();
            } else {
                // Full page editing conflicts with any other session
                $conflicts = $activeEditors->where('admin_id', '!=', $session->admin_id)
                    ->map->toSessionInfo()
                    ->toArray();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'session' => $session->toSessionInfo(),
                    'active_editors' => $activeEditors->map->toSessionInfo(),
                    'conflicts' => $conflicts,
                    'heartbeat_at' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Heartbeat failed', [
                'session_token' => $sessionToken,
                'admin_id' => Auth::guard('admin')->id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Heartbeat failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * End an editing session
     */
    public function endSession(Request $request, string $sessionToken): JsonResponse
    {
        try {
            $session = PageEditingSession::findByToken($sessionToken);

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'code' => 'SESSION_NOT_FOUND',
                    'message' => 'Editing session not found'
                ], 404);
            }

            // Verify session belongs to current user
            if ($session->admin_id !== Auth::guard('admin')->id()) {
                return response()->json([
                    'success' => false,
                    'code' => 'UNAUTHORIZED_SESSION',
                    'message' => 'Session does not belong to current user'
                ], 403);
            }

            $sessionInfo = $session->toSessionInfo();
            $session->end();

            Log::info('Editing session ended', [
                'session_id' => $sessionInfo['id'],
                'page_id' => $session->page_id,
                'admin_id' => $session->admin_id,
                'duration' => $sessionInfo['duration_minutes']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Editing session ended successfully',
                'data' => [
                    'ended_session' => $sessionInfo
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to end editing session', [
                'session_token' => $sessionToken,
                'admin_id' => Auth::guard('admin')->id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to end editing session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Force takeover editing session
     */
    public function takeover(Request $request, int $pageId): JsonResponse
    {
        try {
            $validator = Validator::make([
                'page_id' => $pageId,
                'force' => $request->input('force', false),
                'message' => $request->input('message'),
                'editing_section' => $request->input('editing_section', 'full_page'),
            ], [
                'page_id' => 'required|integer|exists:pages,id',
                'force' => 'boolean',
                'message' => 'nullable|string|max:255',
                'editing_section' => 'required|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $adminId = Auth::guard('admin')->id();
            $force = $request->input('force', false);
            $editingSection = $request->input('editing_section', 'full_page');

            if (!$force) {
                return response()->json([
                    'success' => false,
                    'code' => 'CONFIRMATION_REQUIRED',
                    'message' => 'Force takeover confirmation required'
                ], 400);
            }

            // Get existing sessions
            $existingSessions = PageEditingSession::getActiveForPage($pageId);

            // End all existing sessions for this page
            $endedSessions = $existingSessions->map->toSessionInfo();
            PageEditingSession::where('page_id', $pageId)->delete();

            // Create new session
            $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
            $page = $pageModelClass::findOrFail($pageId);
            $session = PageEditingSession::startSession(
                $pageId,
                $adminId,
                $editingSection,
                [
                    'takeover' => true,
                    'takeover_message' => $request->input('message'),
                    'ended_sessions' => $endedSessions->toArray(),
                    'page_title' => $page->title
                ]
            );

            Log::info('Editing session takeover', [
                'new_session_id' => $session->id,
                'page_id' => $pageId,
                'admin_id' => $adminId,
                'ended_sessions' => $endedSessions->pluck('id')->toArray(),
                'message' => $request->input('message')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Successfully took over editing session',
                'data' => [
                    'session' => $session->toSessionInfo(),
                    'ended_sessions' => $endedSessions,
                    'current_editors' => [$session->toSessionInfo()]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to takeover editing session', [
                'page_id' => $pageId,
                'admin_id' => Auth::guard('admin')->id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to takeover editing session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current editors for a page
     */
    public function getEditors(Request $request, int $pageId): JsonResponse
    {
        try {
            $pageModelClass = config('xgpagebuilder.models.page', \App\Models\Backend\Page::class);
            $page = $pageModelClass::findOrFail($pageId);
            $activeEditors = PageEditingSession::getActiveForPage($pageId);

            return response()->json([
                'success' => true,
                'data' => [
                    'page' => [
                        'id' => $page->id,
                        'title' => $page->title
                    ],
                    'editors' => $activeEditors->map->toSessionInfo(),
                    'has_active_editors' => $activeEditors->isNotEmpty(),
                    'checked_at' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get page editors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cleanup stale editing sessions
     */
    public function cleanup(Request $request): JsonResponse
    {
        try {
            $timeoutMinutes = $request->input('timeout_minutes', 60);
            $deletedCount = PageEditingSession::cleanupStale($timeoutMinutes);

            Log::info('Cleaned up stale editing sessions', [
                'deleted_count' => $deletedCount,
                'timeout_minutes' => $timeoutMinutes
            ]);

            return response()->json([
                'success' => true,
                'message' => "Cleaned up {$deletedCount} stale editing sessions",
                'data' => [
                    'deleted_count' => $deletedCount,
                    'timeout_minutes' => $timeoutMinutes
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cleanup stale sessions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}