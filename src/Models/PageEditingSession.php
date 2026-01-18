<?php

namespace Xgenious\PageBuilder\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PageEditingSession extends Model
{
    protected $table = 'page_editing_sessions';

    protected $fillable = [
        'page_id',
        'admin_id',
        'session_token',
        'editing_section',
        'last_activity',
        'started_at',
        'metadata'
    ];

    protected $casts = [
        'last_activity' => 'datetime',
        'started_at' => 'datetime',
        'metadata' => 'array'
    ];

    /**
     * Start a new editing session
     */
    public static function startSession($pageId, $adminId, $editingSection = 'full_page', $metadata = [])
    {
        return self::create([
            'page_id' => $pageId,
            'admin_id' => $adminId,
            'session_token' => Str::random(32),
            'editing_section' => $editingSection,
            'last_activity' => now(),
            'started_at' => now(),
            'metadata' => $metadata
        ]);
    }

    /**
     * Get active sessions for a page
     */
    public static function getActiveForPage($pageId)
    {
        // Active means last activity within 5 minutes (default)
        return self::where('page_id', $pageId)
            ->where('last_activity', '>=', now()->subMinutes(5))
            ->get();
    }

    /**
     * Find session by token
     */
    public static function findByToken($token)
    {
        return self::where('session_token', $token)->first();
    }

    /**
     * Update activity timestamp
     */
    public function updateActivity()
    {
        $this->update(['last_activity' => now()]);
    }

    /**
     * End the session
     */
    public function end()
    {
        $this->delete();
    }

    /**
     * Cleanup stale sessions
     */
    public static function cleanupStale($minutes = 60)
    {
        return self::where('last_activity', '<', now()->subMinutes($minutes))->delete();
    }

    /**
     * Convert to session info array
     */
    public function toSessionInfo()
    {
        return [
            'id' => $this->id,
            'admin_id' => $this->admin_id,
            'editing_section' => $this->editing_section,
            'last_activity_at' => $this->last_activity->toISOString(),
            'metadata' => $this->metadata,
            'duration_minutes' => $this->created_at->diffInMinutes(now())
        ];
    }
}
