/**
 * CampusBite — Supabase Client Integration & Synchronization Layer
 * Provides PostgreSQL hosted database connection with resilient offline fallback
 */
(function (global) {
  'use strict';

  const STORAGE_KEY_SUPABASE = 'campusbite_supabase_config';

  class SupabaseClientManager {
    constructor() {
      this.config = this.loadConfig();
      this.status = 'LOCAL_OFFLINE';
      this.lastSync = null;
    }

    loadConfig() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_SUPABASE);
        return raw ? JSON.parse(raw) : { url: '', anonKey: '', enabled: false };
      } catch (e) {
        return { url: '', anonKey: '', enabled: false };
      }
    }

    saveConfig(url, anonKey, enabled = true) {
      this.config = {
        url: (url || '').trim(),
        anonKey: (anonKey || '').trim(),
        enabled: Boolean(enabled)
      };
      try {
        localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(this.config));
      } catch (e) {
        console.warn('Could not persist Supabase config:', e);
      }
      return this.checkConnection();
    }

    async checkConnection() {
      if (!this.config.url || !this.config.anonKey || !this.config.enabled) {
        this.status = 'LOCAL_OFFLINE';
        return { success: false, status: this.status, message: 'Running in Local Storage Mode (Offline Safe)' };
      }

      try {
        // Ping public foods endpoint or healthcheck
        const endpoint = `${this.config.url.replace(/\/+$/, '')}/rest/v1/foods?select=id&limit=1`;
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'apikey': this.config.anonKey,
            'Authorization': `Bearer ${this.config.anonKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          this.status = 'CONNECTED';
          this.lastSync = new Date().toISOString();
          return { success: true, status: this.status, message: 'Connected to Hosted Supabase PostgreSQL' };
        } else {
          this.status = 'CONFIG_ERROR';
          return { success: false, status: this.status, message: `Supabase returned HTTP ${res.status}` };
        }
      } catch (err) {
        this.status = 'NETWORK_ERROR';
        return { success: false, status: this.status, message: `Could not reach Supabase endpoint (${err.message})` };
      }
    }

    getStatus() {
      return {
        status: this.status,
        url: this.config.url,
        hasKey: Boolean(this.config.anonKey),
        enabled: this.config.enabled,
        lastSync: this.lastSync
      };
    }
  }

  global.CampusBiteSupabase = new SupabaseClientManager();
})(typeof window !== 'undefined' ? window : this);
