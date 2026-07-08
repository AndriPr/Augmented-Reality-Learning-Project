import { UIController } from './ui/ui-controller.js';
import { AREngine } from './ar/ar-engine.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI first so loading screen works immediately
    const ui = new UIController();
    
    // Initialize AR Engine and pass UI controller for callbacks
    const ar = new AREngine(ui);
});
