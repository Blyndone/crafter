console.log("Crafter || Active");
class Crafter{
    static ID = 'crafter';
    static TEMPLATES = {
        CRAFTER: `modules/${this.ID}/templates/crafter.hbs`
    }

    static log(force, ...args) {
        const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }



/**
 * A single Recipe in our list of Recipes.
 * @typedef {Object} Recipe
 * @property {string} id - A unique ID to identify this recipe.
 * @property {string} label - The text of the name of the recipe.
 * @property {string} professionType - The profession that crafts this recipe
 * @property {Object} Component - an object that contains what kind of materials can be used
 * @property {string} craftingTime - time required to craft item
 * @property {string} difficulty - Either a check needed or a profeciency needed
 */

/**
 * A single Component used in a recipe.
 * @typedef {Object} Component
 * @property {string} id - A unique ID to identify this component.
 * @property {string} label - The text of the name of the component.
 * @property {string} keyType - keyword that designates the type of material
 * @property {int} value - the cost of the component in GP
 * @property {int} quantity - the number of items to satisfy the recipe 
 */





}

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(Crafter.ID);
  });

 