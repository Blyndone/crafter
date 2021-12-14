console.log("Crafter || Active");
class Crafter {
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
     * @property {string} keyword - keyword that designates the type of material
     * @property {int} value - the cost of the component in GP
     * @property {int} quantity - the number of items to satisfy the recipe 
     * @property {boolean} isComponent - true for compoenents
     */


}

Hooks.once('devModeReady', ({
    registerPackageDebugFlag
}) => {
    registerPackageDebugFlag(Crafter.ID);
});


class RecipeData {

        //returns the description of an item by searching for an exact name
    static descriptionFromName(name) {

        return game.items.getName(name).data.data.description.value;

    }
    //returns the name of an item by searching for the exact description
    static searchDescription(term) {
        
        return game.items.find(item => item.data.data.description.value === term).data.name;
    }
    //returns an array of item keys based 
    static findComponents(book, term) {  
        let bookObj = game.actors.getName(book);
        let multiObj = bookObj.data.items.filter(item => (item.data.data.description.value).includes(term) );
        let multi = [];
        for (let i = 0; i< multiObj.length; i++){
            multi.push(multiObj[i].data._id)
        }
        return  multi;
    }
    // creates a Component Object from an item key
    static createComponent (actor, key){
        let item = actor.data.items.get(key);
        let kwStart = (item.data.data.description.value).indexOf("@");
        let kw = (item.data.data.description.value).slice(kwStart+1, kwStart+5);

        const newComponent = {
            id: foundry.utils.randomID(16),
            label: item.data.name,
            keyword: kw,
            value: item.data.data.price,
            quantity: 1
        }

            return newComponent;
    }
        //creates a recipe Item on Book actor with a component?
    static createRecipe(book, targetItem){
        
      //  const recipe = {
     //       id: foundry.utils.randomID(16),
       //     label: targetItem,
          //  professionType: prof,
            //Component: this.createComponent(book,componentKey),
       //     craftingTime: cTime,
   //         difficulty: diff
    //    }

        
      //  const recipeData = {
      //      _id: foundry.utils.randomID(16),
      //      name: targetItem.name,
    //        type: targetItem.type,
    //        folder: null
    //    }

        const tempItem = new game.dnd5e.entities.Item5e( 
            {
              name: "(Recipe)"+targetItem.name,
              type: targetItem.type,
              data: {
                name: "(Recipe)"+targetItem.name,
                description: {
                    value: targetItem.data.data.description.value+" xxxRecipexxx"
                }
                  

              },
              img: targetItem.img,

                              
            }
            
          );

          const mergedItem = new mergeObject(targetItem, tempItem, {overwrite: true});


        book.createEmbeddedDocuments("Item", [mergedItem.toObject()]); 
            Crafter.log(false, mergedItem);
            Crafter.log(false, tempItem);
    //    let finishedRecipeItem = recipe;
        return mergedItem;
    }

    static findRecipes(book, componentKey){
        book = game.actors.getName(book);
        let multiObj = book.data.items.filter(item => (item.data.data.description.value).includes(componentKey) );
        let multi = [];
        for (let i = 0; i< multiObj.length; i++){
            multi.push(multiObj[i].data._id)
        }
        return  multi;
        return rec;


    }
  /*   //finds recipes within a recipe book actor by name and keyword
    static findBook (name, keyword)  {
        let book = game.actors.getName(name);
        let recipe = [this.searchDescriptionMulti(book, keyword)];
        let allRecipe = [];
        for (let i=0; i<recipe.length; i++){
            allRecipe.push(this.createComponent(book, recipe[0][i]));
        }
       
        
        return  allRecipe;
 
    }*/

}