import { UIController } from './ui/ui-controller.js?v=15';
import { AREngine } from './ar/ar-engine.js?v=15';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI first so loading screen works immediately
    const ui = new UIController();
    
    // Initialize AR Engine and pass UI controller for callbacks
    const ar = new AREngine(ui);
});
