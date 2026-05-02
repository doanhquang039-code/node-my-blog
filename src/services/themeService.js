const db = require('../config/db');

class ThemeService {
    /**
     * Get all theme presets
     */
    async getPresets() {
        const query = `
            SELECT id, name, description, colors, fonts, is_default
            FROM theme_presets
            WHERE is_active = true
            ORDER BY is_default DESC, name ASC
        `;
        
        const [presets] = await db.execute(query);
        
        // Parse JSON fields
        return presets.map(preset => ({
            ...preset,
            colors: typeof preset.colors === 'string' ? JSON.parse(preset.colors) : preset.colors,
            fonts: typeof preset.fonts === 'string' ? JSON.parse(preset.fonts) : preset.fonts
        }));
    }

    /**
     * Get user's current theme
     */
    async getUserTheme(userId) {
        const query = `
            SELECT ut.*, tp.name as preset_name, tp.colors, tp.fonts
            FROM user_themes ut
            LEFT JOIN theme_presets tp ON ut.preset_id = tp.id
            WHERE ut.user_id = ?
        `;
        
        const [themes] = await db.execute(query, [userId]);
        
        if (themes.length === 0) {
            // Return default theme
            return await this.getDefaultTheme();
        }
        
        const theme = themes[0];
        
        return {
            ...theme,
            colors: typeof theme.colors === 'string' ? JSON.parse(theme.colors) : theme.colors,
            fonts: typeof theme.fonts === 'string' ? JSON.parse(theme.fonts) : theme.fonts,
            custom_css: theme.custom_css || ''
        };
    }

    /**
     * Get default theme
     */
    async getDefaultTheme() {
        const query = `
            SELECT * FROM theme_presets
            WHERE is_default = true
            LIMIT 1
        `;
        
        const [themes] = await db.execute(query);
        
        if (themes.length === 0) {
            // Return hardcoded default
            return {
                name: 'Default',
                colors: {
                    primary: '#007bff',
                    secondary: '#6c757d',
                    background: '#ffffff',
                    text: '#212529'
                },
                fonts: {
                    heading: 'Arial, sans-serif',
                    body: 'Arial, sans-serif'
                }
            };
        }
        
        const theme = themes[0];
        return {
            ...theme,
            colors: typeof theme.colors === 'string' ? JSON.parse(theme.colors) : theme.colors,
            fonts: typeof theme.fonts === 'string' ? JSON.parse(theme.fonts) : theme.fonts
        };
    }

    /**
     * Apply theme preset to user
     */
    async applyPreset(userId, presetId) {
        // Check if user theme exists
        const [existing] = await db.execute(
            'SELECT id FROM user_themes WHERE user_id = ?',
            [userId]
        );

        if (existing.length === 0) {
            // Insert new user theme
            const query = `
                INSERT INTO user_themes (user_id, preset_id, created_at, updated_at)
                VALUES (?, ?, NOW(), NOW())
            `;
            await db.execute(query, [userId, presetId]);
        } else {
            // Update existing user theme
            const query = `
                UPDATE user_themes
                SET preset_id = ?, updated_at = NOW()
                WHERE user_id = ?
            `;
            await db.execute(query, [presetId, userId]);
        }
    }

    /**
     * Create custom theme
     */
    async createCustomTheme(userId, themeData) {
        const query = `
            INSERT INTO custom_themes
            (user_id, name, colors, fonts, custom_css, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const [result] = await db.execute(query, [
            userId,
            themeData.name,
            JSON.stringify(themeData.colors || {}),
            JSON.stringify(themeData.fonts || {}),
            themeData.custom_css || ''
        ]);

        return result.insertId;
    }

    /**
     * Update custom theme
     */
    async updateCustomTheme(themeId, userId, themeData) {
        const query = `
            UPDATE custom_themes
            SET name = ?,
                colors = ?,
                fonts = ?,
                custom_css = ?,
                updated_at = NOW()
            WHERE id = ? AND user_id = ?
        `;
        
        await db.execute(query, [
            themeData.name,
            JSON.stringify(themeData.colors || {}),
            JSON.stringify(themeData.fonts || {}),
            themeData.custom_css || '',
            themeId,
            userId
        ]);
    }

    /**
     * Delete custom theme
     */
    async deleteCustomTheme(themeId, userId) {
        const query = `
            DELETE FROM custom_themes
            WHERE id = ? AND user_id = ?
        `;
        
        await db.execute(query, [themeId, userId]);
    }

    /**
     * Get user's custom themes
     */
    async getUserCustomThemes(userId) {
        const query = `
            SELECT id, name, colors, fonts, custom_css, created_at, updated_at
            FROM custom_themes
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;
        
        const [themes] = await db.execute(query, [userId]);
        
        // Parse JSON fields
        return themes.map(theme => ({
            ...theme,
            colors: typeof theme.colors === 'string' ? JSON.parse(theme.colors) : theme.colors,
            fonts: typeof theme.fonts === 'string' ? JSON.parse(theme.fonts) : theme.fonts
        }));
    }
}

module.exports = new ThemeService();
