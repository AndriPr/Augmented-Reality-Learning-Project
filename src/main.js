import { UIController } from './ui/ui-controller.js?v=8';
import { AREngine } from './ar/ar-engine.js?v=8';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI first so loading screen works immediately
    const ui = new UIController();
    
    // Initialize AR Engine and pass UI controller for callbacks
    const ar = new AREngine(ui);
});
