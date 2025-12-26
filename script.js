class ColorGenerator {
    constructor() {
        this.colors = [];
        this.history = this.loadHistory();
        this.favorites = this.loadFavorites();
        this.lockedColors = new Set();
        this.currentMode = 'random';
        this.isPicking = false;

        this.initializeElements();
        this.attachEventListeners();
        this.updateFavoritesCount();
        this.generateInitialPalette();
    }

    initializeElements() {
        // Éléments principaux
        this.primaryColorCard = document.getElementById('primaryColor');
        this.paletteGrid = document.getElementById('paletteGrid');
        this.historyList = document.getElementById('historyList');

        // Contrôles
        this.colorCountSlider = document.getElementById('colorCount');
        this.colorCountValue = document.getElementById('colorCountValue');
        this.generateBtn = document.getElementById('generateBtn');
        this.savePaletteBtn = document.getElementById('savePalette');
        this.exportPaletteBtn = document.getElementById('exportPalette');
        this.resetAllBtn = document.getElementById('resetAll');

        // Plages HSL
        this.hueMin = document.getElementById('hueMin');
        this.hueMax = document.getElementById('hueMax');
        this.satMin = document.getElementById('satMin');
        this.satMax = document.getElementById('satMax');
        this.lightMin = document.getElementById('lightMin');
        this.lightMax = document.getElementById('lightMax');

        // Boutons d'action
        this.copyPrimaryBtn = document.getElementById('copyPrimary');
        this.lockPrimaryBtn = document.getElementById('lockPrimary');
        this.favoritePrimaryBtn = document.getElementById('favoritePrimary');
        this.favoritesBtn = document.getElementById('favoritesBtn');

        // Modals
        this.exportModal = document.getElementById('exportModal');
        this.favoritesModal = document.getElementById('favoritesModal');
        this.exportClose = document.getElementById('exportClose');
        this.favoritesClose = document.getElementById('favoritesClose');
        this.exportCode = document.getElementById('exportCode');
        this.copyExportBtn = document.getElementById('copyExport');
        this.downloadExportBtn = document.getElementById('downloadExport');

        // Pipette
        this.colorPicker = document.getElementById('colorPicker');
        this.closePicker = document.getElementById('closePicker');
        this.startPicking = document.getElementById('startPicking');
        this.addToPalette = document.getElementById('addToPalette');
        this.pickedColors = document.getElementById('pickedColors');

        // Autres
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.notification = document.getElementById('notification');
        this.favoritesGrid = document.getElementById('favoritesGrid');
    }

    attachEventListeners() {
        // Contrôles principaux
        this.colorCountSlider.addEventListener('input', (e) => {
            this.colorCountValue.textContent = e.target.value;
        });

        this.generateBtn.addEventListener('click', () => this.generatePalette());

        // Modes de génération
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setGenerationMode(btn.dataset.mode));
        });

        // Actions
        this.savePaletteBtn.addEventListener('click', () => this.saveCurrentPalette());
        this.exportPaletteBtn.addEventListener('click', () => this.showExportModal());
        this.resetAllBtn.addEventListener('click', () => this.resetAll());

        // Couleur principale
        this.copyPrimaryBtn.addEventListener('click', () => this.copyColorCode(this.colors[0]));
        this.lockPrimaryBtn.addEventListener('click', () => this.toggleLock(0));
        this.favoritePrimaryBtn.addEventListener('click', () => this.toggleFavorite(this.colors[0]));

        // Modals
        this.exportClose.addEventListener('click', () => this.hideExportModal());
        this.favoritesClose.addEventListener('click', () => this.hideFavoritesModal());
        this.favoritesBtn.addEventListener('click', () => this.showFavoritesModal());

        [this.exportModal, this.favoritesModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });

        // Export
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => this.exportPalette(btn.dataset.format));
        });

        this.copyExportBtn.addEventListener('click', () => this.copyExportCode());
        this.downloadExportBtn.addEventListener('click', () => this.downloadExport());

        // Pipette
        this.closePicker.addEventListener('click', () => this.hideColorPicker());
        this.startPicking.addEventListener('click', () => this.startColorPicking());
        this.addToPalette.addEventListener('click', () => this.addPickedColorsToPalette());

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Mise à jour en temps réel des inputs range
        [this.hueMin, this.hueMax, this.satMin, this.satMax, this.lightMin, this.lightMax].forEach(input => {
            input.addEventListener('input', () => this.validateRangeInputs());
        });
    }

    generateInitialPalette() {
        this.generatePalette();
    }

    generatePalette() {
        const count = parseInt(this.colorCountSlider.value);
        const newColors = [];

        for (let i = 0; i < count; i++) {
            if (this.lockedColors.has(i) && this.colors[i]) {
                newColors.push(this.colors[i]);
            } else {
                newColors.push(this.generateColor());
            }
        }

        this.colors = newColors;
        this.updateDisplay();
        this.addToHistory(this.colors);
        this.showNotification('Palette générée avec succès !', 'success');
    }

    generateColor() {
        const hueMin = parseInt(this.hueMin.value);
        const hueMax = parseInt(this.hueMax.value);
        const satMin = parseInt(this.satMin.value);
        const satMax = parseInt(this.satMax.value);
        const lightMin = parseInt(this.lightMin.value);
        const lightMax = parseInt(this.lightMax.value);

        let hue, saturation, lightness;

        switch (this.currentMode) {
            case 'harmonious':
                hue = this.generateHarmoniousHue(hueMin, hueMax);
                break;
            case 'analogous':
                hue = this.generateAnalogousHue(hueMin, hueMax);
                break;
            case 'gradient':
                hue = this.generateGradientHue(hueMin, hueMax);
                break;
            default: // random
                hue = this.randomBetween(hueMin, hueMax);
        }

        saturation = this.randomBetween(satMin, satMax);
        lightness = this.randomBetween(lightMin, lightMax);

        const hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        const hex = this.hslToHex(hue, saturation, lightness);
        const rgb = this.hslToRgb(hue, saturation, lightness);
        const name = this.getColorName(hue, saturation, lightness);

        return {
            hsl: hsl,
            hex: hex,
            rgb: rgb,
            name: name,
            hue: hue,
            saturation: saturation,
            lightness: lightness
        };
    }

    generateHarmoniousHue(min, max) {
        // Génère des teintes harmonieuses (complémentaires, triadiques, etc.)
        const baseHue = this.randomBetween(min, max);
        const variations = [0, 180, 120, 240, 60, 300]; // Complémentaires et triadiques
        return baseHue + variations[Math.floor(Math.random() * variations.length)];
    }

    generateAnalogousHue(min, max) {
        // Génère des teintes analogues (proches)
        const baseHue = this.randomBetween(min, max);
        const variation = this.randomBetween(-30, 30);
        return (baseHue + variation + 360) % 360;
    }

    generateGradientHue(min, max) {
        // Génère un dégradé progressif
        if (!this.colors.length) return this.randomBetween(min, max);

        const lastHue = this.colors[this.colors.length - 1].hue;
        const step = (max - min) / 10;
        return (lastHue + step) % (max - min) + min;
    }

    setGenerationMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        this.showNotification(`Mode "${mode}" activé`, 'info');
    }

    updateDisplay() {
        // Couleur principale
        if (this.colors.length > 0) {
            const primaryColor = this.colors[0];
            this.primaryColorCard.querySelector('.color-preview').style.background = primaryColor.hsl;
            this.primaryColorCard.querySelector('.color-code').textContent = primaryColor.hex.toUpperCase();
            this.primaryColorCard.querySelector('.color-name').textContent = primaryColor.name;

            // États des boutons
            this.lockPrimaryBtn.classList.toggle('active', this.lockedColors.has(0));
            this.favoritePrimaryBtn.classList.toggle('favorited', this.isFavorite(primaryColor));
        }

        // Grille de palette
        this.paletteGrid.innerHTML = '';
        this.colors.forEach((color, index) => {
            const colorElement = this.createColorElement(color, index);
            this.paletteGrid.appendChild(colorElement);
        });
    }

    createColorElement(color, index) {
        const element = document.createElement('div');
        element.className = 'palette-color';
        element.innerHTML = `
            <div class="color-preview" style="background: ${color.hsl}"></div>
            <div class="color-info">
                <div class="color-code">${color.hex.toUpperCase()}</div>
                <div class="color-name">${color.name}</div>
            </div>
        `;

        if (this.lockedColors.has(index)) {
            element.classList.add('locked');
        }

        // Événements
        element.addEventListener('click', () => this.selectColor(color, index));

        return element;
    }

    selectColor(color, index) {
        // Met à jour la couleur principale
        this.colors[0] = color;
        this.updateDisplay();
        this.showNotification(`Couleur ${color.hex.toUpperCase()} sélectionnée`, 'info');
    }

    toggleLock(index) {
        if (this.lockedColors.has(index)) {
            this.lockedColors.delete(index);
            this.showNotification('Couleur déverrouillée', 'info');
        } else {
            this.lockedColors.add(index);
            this.showNotification('Couleur verrouillée', 'info');
        }
        this.updateDisplay();
    }

    toggleFavorite(color) {
        const index = this.favorites.findIndex(fav => fav.hex === color.hex);

        if (index !== -1) {
            this.favorites.splice(index, 1);
            this.showNotification('Retiré des favoris', 'info');
        } else {
            this.favorites.push(color);
            this.showNotification('Ajouté aux favoris', 'success');
        }

        this.updateFavoritesCount();
        this.saveFavorites();
    }

    isFavorite(color) {
        return this.favorites.some(fav => fav.hex === color.hex);
    }

    updateFavoritesCount() {
        const count = this.favorites.length;
        document.getElementById('favoriteCount').textContent = count;
        document.getElementById('favoriteCount').style.display = count > 0 ? 'inline' : 'none';
    }

    saveCurrentPalette() {
        const palette = {
            colors: this.colors,
            timestamp: new Date().toISOString(),
            mode: this.currentMode
        };

        // Ajouter au début de l'historique
        this.history.unshift(palette);

        // Garder seulement les 20 dernières palettes
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }

        this.saveHistory();
        this.updateHistoryDisplay();
        this.showNotification('Palette sauvegardée dans l\'historique', 'success');
    }

    addToHistory(colors) {
        const palette = {
            colors: [...colors],
            timestamp: new Date().toISOString(),
            mode: this.currentMode
        };

        this.history.unshift(palette);

        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }

        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.historyList.innerHTML = '';

        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-clock"></i>
                    <p>Aucune palette générée</p>
                </div>
            `;
            return;
        }

        this.history.slice(0, 6).forEach((palette, index) => {
            const historyElement = this.createHistoryElement(palette, index);
            this.historyList.appendChild(historyElement);
        });
    }

    createHistoryElement(palette, index) {
        const element = document.createElement('div');
        element.className = 'history-item';

        const colorsHtml = palette.colors.slice(0, 5).map(color =>
            `<div class="history-color" style="background: ${color.hsl}"></div>`
        ).join('');

        const timestamp = new Date(palette.timestamp).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        element.innerHTML = `
            <div class="history-palette">${colorsHtml}</div>
            <div class="history-info">
                <div class="timestamp">${timestamp}</div>
            </div>
        `;

        element.addEventListener('click', () => this.loadPaletteFromHistory(palette));

        return element;
    }

    loadPaletteFromHistory(palette) {
        this.colors = [...palette.colors];
        this.currentMode = palette.mode;
        this.updateDisplay();
        this.showNotification('Palette chargée depuis l\'historique', 'info');
    }

    showExportModal() {
        this.exportModal.classList.add('show');
        this.exportPalette('css'); // Format par défaut
    }

    hideExportModal() {
        this.exportModal.classList.remove('show');
    }

    hideModal(modal) {
        modal.classList.remove('show');
    }

    exportPalette(format) {
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });

        let code = '';
        switch (format) {
            case 'css':
                code = this.generateCSSExport();
                break;
            case 'scss':
                code = this.generateSCSSExport();
                break;
            case 'json':
                code = this.generateJSONExport();
                break;
            case 'png':
                this.generatePNGExport();
                return;
        }

        this.exportCode.value = code;
    }

    generateCSSExport() {
        let css = '/* Palette de couleurs */\n\n:root {\n';
        this.colors.forEach((color, index) => {
            css += `  --color-${index + 1}: ${color.hex};\n`;
        });
        css += '}\n\n';

        this.colors.forEach((color, index) => {
            css += `/* Couleur ${index + 1}: ${color.name} */\n`;
            css += `.color-${index + 1} { background: ${color.hex}; }\n\n`;
        });

        return css;
    }

    generateSCSSExport() {
        let scss = '// Palette de couleurs\n\n';
        this.colors.forEach((color, index) => {
            scss += `$color-${index + 1}: ${color.hex}; // ${color.name}\n`;
        });
        scss += '\n';

        scss += '// Classes utilitaires\n';
        this.colors.forEach((color, index) => {
            scss += `.bg-color-${index + 1} { background: $color-${index + 1}; }\n`;
            scss += `.text-color-${index + 1} { color: $color-${index + 1}; }\n`;
        });

        return scss;
    }

    generateJSONExport() {
        const data = {
            palette: this.colors.map(color => ({
                name: color.name,
                hex: color.hex,
                hsl: color.hsl,
                rgb: color.rgb,
                hue: color.hue,
                saturation: color.saturation,
                lightness: color.lightness
            })),
            generated: new Date().toISOString(),
            mode: this.currentMode
        };

        return JSON.stringify(data, null, 2);
    }

    generatePNGExport() {
        // Créer un canvas avec la palette
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const colorWidth = 100;
        const colorHeight = 100;

        canvas.width = this.colors.length * colorWidth;
        canvas.height = colorHeight;

        this.colors.forEach((color, index) => {
            ctx.fillStyle = color.hex;
            ctx.fillRect(index * colorWidth, 0, colorWidth, colorHeight);
        });

        // Télécharger l'image
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `palette-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });

        this.showNotification('Image PNG téléchargée', 'success');
    }

    copyExportCode() {
        this.exportCode.select();
        document.execCommand('copy');
        this.showNotification('Code copié dans le presse-papiers', 'success');
    }

    downloadExport() {
        const format = document.querySelector('.export-btn.active').dataset.format;
        const content = this.exportCode.value;
        const filename = `palette-${Date.now()}.${format === 'scss' ? 'scss' : format}`;
        const mimeType = format === 'json' ? 'application/json' : 'text/plain';

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Fichier téléchargé', 'success');
    }

    showFavoritesModal() {
        this.favoritesModal.classList.add('show');
        this.updateFavoritesDisplay();
    }

    hideFavoritesModal() {
        this.favoritesModal.classList.remove('show');
    }

    updateFavoritesDisplay() {
        this.favoritesGrid.innerHTML = '';

        if (this.favorites.length === 0) {
            this.favoritesGrid.innerHTML = `
                <div class="empty-favorites">
                    <i class="far fa-heart"></i>
                    <p>Aucune couleur favorite</p>
                </div>
            `;
            return;
        }

        this.favorites.forEach((color, index) => {
            const element = document.createElement('div');
            element.className = 'favorite-color';
            element.innerHTML = `
                <div class="color-preview" style="background: ${color.hsl}"></div>
                <div class="color-info">
                    <div class="color-code">${color.hex.toUpperCase()}</div>
                    <div class="color-name">${color.name}</div>
                </div>
                <button class="remove-favorite" onclick="event.stopPropagation(); colorGenerator.removeFavorite(${index})">
                    ×
                </button>
            `;

            element.addEventListener('click', () => {
                this.selectColor(color, 0);
                this.hideFavoritesModal();
            });

            this.favoritesGrid.appendChild(element);
        });
    }

    removeFavorite(index) {
        this.favorites.splice(index, 1);
        this.updateFavoritesCount();
        this.saveFavorites();
        this.updateFavoritesDisplay();
        this.showNotification('Favori supprimé', 'info');
    }

    showColorPicker() {
        this.colorPicker.classList.add('show');
    }

    hideColorPicker() {
        this.colorPicker.classList.remove('show');
        this.isPicking = false;
        document.body.style.cursor = 'default';
    }

    startColorPicking() {
        this.isPicking = true;
        this.pickedColors.innerHTML = '';
        document.body.style.cursor = 'crosshair';

        this.showNotification('Cliquez sur n\'importe quel élément pour capturer sa couleur', 'info');

        document.addEventListener('click', this.handleColorPick.bind(this), { once: true });
    }

    handleColorPick(e) {
        if (!this.isPicking) return;

        e.preventDefault();
        const element = e.target;
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;

        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
            const rgb = this.parseRgb(backgroundColor);
            const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
            const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

            const color = {
                hex: hex,
                rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
                name: this.getColorName(hsl.h, hsl.s, hsl.l)
            };

            this.addPickedColor(color);
        }

        this.isPicking = false;
        document.body.style.cursor = 'default';
    }

    addPickedColor(color) {
        const element = document.createElement('div');
        element.className = 'picked-color';
        element.style.background = color.hex;
        element.title = `${color.name} - ${color.hex}`;

        element.addEventListener('click', () => {
            document.querySelectorAll('.picked-color').forEach(el => el.classList.remove('selected'));
            element.classList.add('selected');
        });

        this.pickedColors.appendChild(element);
    }

    addPickedColorsToPalette() {
        const selectedColors = [];

        document.querySelectorAll('.picked-color.selected').forEach(element => {
            const hex = element.style.background;
            // Convertir la couleur capturée en objet complet
            const rgb = this.parseRgb(hex);
            const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

            selectedColors.push({
                hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
                rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
                name: this.getColorName(hsl.h, hsl.s, hsl.l),
                hue: hsl.h,
                saturation: hsl.s,
                lightness: hsl.l
            });
        });

        if (selectedColors.length > 0) {
            this.colors = selectedColors.concat(this.colors).slice(0, parseInt(this.colorCountSlider.value));
            this.updateDisplay();
            this.hideColorPicker();
            this.showNotification(`${selectedColors.length} couleur(s) ajoutée(s) à la palette`, 'success');
        } else {
            this.showNotification('Sélectionnez au moins une couleur', 'warning');
        }
    }

    copyColorCode(color) {
        navigator.clipboard.writeText(color.hex).then(() => {
            this.showNotification(`Code ${color.hex.toUpperCase()} copié !`, 'success');
        }).catch(() => {
            this.fallbackCopyTextToClipboard(color.hex);
        });
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showNotification(`Code ${text.toUpperCase()} copié !`, 'success');
        } catch (err) {
            this.showNotification('Erreur lors de la copie', 'error');
        }

        document.body.removeChild(textArea);
    }

    resetAll() {
        if (confirm('Êtes-vous sûr de vouloir tout réinitialiser ? Cette action est irréversible.')) {
            this.colors = [];
            this.lockedColors.clear();
            this.history = [];
            this.colorCountSlider.value = 5;
            this.colorCountValue.textContent = '5';

            // Réinitialiser les plages
            this.hueMin.value = 0;
            this.hueMax.value = 360;
            this.satMin.value = 30;
            this.satMax.value = 90;
            this.lightMin.value = 40;
            this.lightMax.value = 80;

            this.currentMode = 'random';
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === 'random');
            });

            this.saveHistory();
            this.saveFavorites();
            this.generatePalette();
            this.showNotification('Tout a été réinitialisé', 'info');
        }
    }

    validateRangeInputs() {
        // S'assurer que min <= max
        if (parseInt(this.hueMin.value) > parseInt(this.hueMax.value)) {
            this.hueMax.value = this.hueMin.value;
        }
        if (parseInt(this.satMin.value) > parseInt(this.satMax.value)) {
            this.satMax.value = this.satMin.value;
        }
        if (parseInt(this.lightMin.value) > parseInt(this.lightMax.value)) {
            this.lightMax.value = this.lightMin.value;
        }
    }

    handleKeyboard(e) {
        // Ctrl+G pour générer
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
            e.preventDefault();
            this.generatePalette();
        }

        // Ctrl+S pour sauvegarder
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveCurrentPalette();
        }

        // Ctrl+C pour copier la couleur principale
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault();
            if (this.colors.length > 0) {
                this.copyColorCode(this.colors[0]);
            }
        }

        // Échap pour fermer les modals
        if (e.key === 'Escape') {
            this.hideExportModal();
            this.hideFavoritesModal();
            this.hideColorPicker();
        }
    }

    showNotification(message, type = 'info') {
        const notificationText = document.getElementById('notificationText');
        const notificationIcon = this.notification.querySelector('i');

        notificationText.textContent = message;

        const icons = {
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle',
            info: 'fa-info-circle'
        };
        notificationIcon.className = `fas ${icons[type] || 'fa-info-circle'}`;

        const colors = {
            success: '#4CAF50',
            warning: '#ff9800',
            error: '#f44336',
            info: '#2196F3'
        };
        this.notification.querySelector('.notification-content').style.background = colors[type] || colors.info;

        this.notification.classList.add('show');

        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 4000);
    }

    // Utilitaires pour les couleurs
    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `rgb(${r}, ${g}, ${b})`;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    parseRgb(rgbString) {
        const match = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return match ? {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        } : { r: 0, g: 0, b: 0 };
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    getColorName(h, s, l) {
        // Noms de couleurs simples basés sur HSL
        if (s < 10 && l > 90) return 'Blanc';
        if (s < 10 && l < 10) return 'Noir';
        if (l < 20) return 'Très sombre';
        if (l > 90) return 'Très clair';

        const hueNames = {
            0: 'Rouge', 15: 'Rouge-orange', 30: 'Orange', 45: 'Jaune-orange',
            60: 'Jaune', 75: 'Jaune-vert', 90: 'Vert-jaune', 105: 'Vert',
            120: 'Vert-bleu', 135: 'Cyan', 150: 'Bleu-cyan', 165: 'Bleu',
            180: 'Bleu-violet', 195: 'Violet', 210: 'Magenta', 225: 'Rose',
            240: 'Magenta-rose', 255: 'Rouge-magenta', 270: 'Violet', 285: 'Bleu-violet',
            300: 'Magenta', 315: 'Rouge-magenta', 330: 'Rouge', 345: 'Rouge-orange'
        };

        const hueKey = Math.round(h / 15) * 15;
        const baseName = hueNames[hueKey] || 'Inconnu';

        if (s < 30) return `${baseName} pâle`;
        if (s > 80) return `${baseName} vif`;
        if (l < 40) return `${baseName} foncé`;
        if (l > 70) return `${baseName} clair`;

        return baseName;
    }

    // Sauvegarde
    saveHistory() {
        localStorage.setItem('color-generator-history', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('color-generator-history');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('color-generator-favorites', JSON.stringify(this.favorites));
    }

    loadFavorites() {
        const saved = localStorage.getItem('color-generator-favorites');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.colorGenerator = new ColorGenerator();
});

// Gestion des erreurs
window.addEventListener('error', (e) => {
    console.error('Erreur dans le générateur de couleurs:', e.message);
});
