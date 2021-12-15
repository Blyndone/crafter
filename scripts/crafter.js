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

     static cptHook(){
        CRAFTER.LOG(false, "Hooked");
        }

    static initialize() {
         this.recipeMenu = new RecipeMenu();
         }




    static renderJournalDirectory(app, html)
   {
        const button = $(`<button class="crafter-button">Crafing Menu</button>`);

         let footer = html.find('.directory-footer');
         if (footer.length === 0)
         {
            footer = $(`<footer class="directory-footer"></footer>`);
            html.append(footer);
         }
         footer.append(button);

          button.click(() =>
         {  
            Crafter.recipeMenu.render(true);
         }); 
      

   /*    if (!(game.user.isGM && game.settings.get(constants.moduleName, settings.showFolder)))
      {
         const folder = Utils.getQuestFolder();
         if (folder !== void 0)
         {
            const element = html.find(`.folder[data-folder-id="${folder.id}"]`);
            if (element !== void 0)
            {
               element.remove();
            }
         }
      } */
   }   






}

Hooks.once('devModeReady', ({
    registerPackageDebugFlag
}) => {
    registerPackageDebugFlag(Crafter.ID);
});

Hooks.on('renderJournalDirectory', Crafter.renderJournalDirectory);



  Hooks.once('init', () => {
    Crafter.initialize();
  });





// book- name of actor to be used as Receipe book, targetItem name of Item to be transformed
async function createRecipe(book, targetItem){
    let tempTag = ['Curative', 'Plant', 'Healing'];
    
    let protoItem  = duplicate(game.items.getName(targetItem));
    book = game.actors.getName(book);

    await book.createEmbeddedDocuments("Item", [protoItem]);
    let item = book.data.items.find(i=>i.name === targetItem);
    
    let updates = {
            _id: item.id,
            name: "(Recipe)" + item.name,
            data: {
                description: {
                    value: item.data.data.description.value + RecipeData.recipeTagger("Alchemy", "12 Hours", "DC = 15", tempTag)
                }
            }
        }

    await book.updateEmbeddedDocuments("Item",[updates]);
    return item;
    }


class RecipeData {
   

        //returns the description of an item by searching for an exact name
    static descriptionFromName(name) {

        return game.items.getName(name).data.data.description.value;

    }


    //returns the name of an item by searching for the exact description
    static searchDescription(term) {
        
        return game.items.find(item => item.data.data.description.value === term).data.name;
    }
    static itemFromName(name) {
        
        return game.items.getName(name);
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

    static recipeTagger(professionType, craftingTime, difficulty, ...component){
        let build = [];
        build.push("<br>@")
        for (let i = 0; i < [...component].length; i++) {
            build.push(build[i]+"<br>@");            
        }
        build.push(professionType+"<br>@");
        build.push(craftingTime+"<br>@");
        build.push(difficulty);
        Crafter.log(false,build);
        let tags = "";
        for (let i = 0; i < build.length; i++) {
            tags = tags.concat(build[i]);
            
        }
        Crafter.log(false,tags);
        return tags;



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
class CraftingMenu extends FormApplication{
    
}

class RecipeMenu extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            closeOnSubmit: false,
            height: '700',
            width: '500',
            id: 'crafter',
            submitOnChange: true,
            template: Crafter.TEMPLATES.CRAFTER,
            title: 'Recipe Menu',
            currentItem: 'Potion of Healing',

        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions;

    }
    getData(options) {
    //    if (this.currentItem === undefined){
   //         return RecipeData.itemFromName("Potion of Healing")
    //    }else
        return {
            item: RecipeData.itemFromName(this.currentItem)
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
      }
    

    async _updateObject(event, formData) {
        if (event.type === "submit"){
        const caller = event.submitter.value;
        switch (caller) {
            case 'changeItem': {
                this.currentItem = formData.submitText;
                this.render();
                break;
            }
            case 'createRecipe': {
            Crafter.log(false,"Creating Recipe", formData)
            if (formData.bookName && this.currentItem){
                Crafter.log(false, "Crafting is Ready");
                createRecipe(formData.bookName, this.currentItem);
            }else{
                Crafter.log(false, "Crafting Failed",formData.bookName, this.currentItem.name)
            }


            




                break;
            }
            default:
        }
        }
        // console.log(formData);
        // console.log("Form Data ^");
        // console.log(event);

       

        }

    async _handleButtonClick (event){
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;
        const toDoId = clickedElement.parents('[data-todo-id]')?.data()?.todoId;
        if(action){
        
        
        switch(action){
            case 'create': {
                await Crafter.log(false, 'Create',action)
                this.currentItem = "Healing Herbs";
                this.render();
                break;
            }
            case 'delete':{
                await Crafter.log(false, 'Delete ',action)
                this.currentItem = "Dagger";
                this.render();
                break;
            }
            case 'createRecipe':{
                createRecipe('[book-name]', '[item.name]');
                this.render();

            }
            
            default :
                Crafter.log(false, 'Invalid action detected ',action)
            this.render();

        }
    }


    }  


}
