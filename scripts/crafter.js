//Test234asdfsdf
class Crafter {
    static ID = 'crafter';
    static COMPPACK = '';
    static RECIPEPACK = '';

    static TEMPLATES = {
        RECIPE: `modules/${this.ID}/templates/recipe.hbs`,
        CRAFTING: `modules/${this.ID}/templates/crafting.hbs`,
        PROXY: `modules/${this.ID}/templates/proxy.hbs`
    }

    static log(force, ...args) {
        const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }


////////game.packs.get("world.craft-comps").index.find(i=>i.name == "Arrow").img
    /**
     * A single Recipe in our list of Recipes.
     * @typedef {Object} Recipe
     * @property {string} id - A unique ID to identify this recipe.
     * @property {string} label - The text of the name of the recipe.
     * @property {string} professionType - The profession that crafts this recipe
     * @property {Object} Component - an object that contains what kind of materials can be used
     * @property {string} craftingTime - time required to craft item
     * @property {string} difficulty - Either a check needed or a profeciency needed
     * 

     * 
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
     * 
     * 
     * 
     * Variable names
     *      Actors
     * Book - book
     * Book Name - bookName 
     * Crafter - crafter
     * Crafter Name - crafterName
     * 
     *      Item
     * Single Item - item
     * Single Recipe - recipe
     * Single Component - comp
     * 
     * Multiple Item - itemA
     * Multiple Recipe - recipeA
     * Multipe Component - compA
     * 
     * Single Item Name - itemName
     * Single Recipe Name - recipeName
     * Single Component Name -compName
     * 
     * Multiple Item Name - itemNameA
     * Multiple Recipe Name - recipeNameA
     * Multipe Component Name - compNameA
     * 
     * 
     * 
     * 
     */

    
    static initialize() {
         this.recipeMenu = new RecipeMenu();
         this.craftingMenu = new CraftingMenu();
         this.proxyMenu = new ProxyMenu();
         }





    static renderJournalDirectory(app, html)
   {
    if ((game.user.isGM)){
        const button = $(`<button class="crafter-recipe-button">Recipe Menu</button>`);

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
        }

        
            const button2 = $(`<button class="crafter-crafter-button"  width = "100" align = right>Crafting Menu</button>`);
    
             let footer = html.find('.directory-footer');
             if (footer.length === 0)
             {
                footer = $(`<footer class="directory-footer"></footer>`);
                html.append(footer);
             }
             footer.append(button2);
    
              button2.click(() =>
             {  
          
                Crafter.craftingMenu.render(true); 
             }); 
   }   

}

Hooks.once('devModeReady', ({
    registerPackageDebugFlag
}) => {
    registerPackageDebugFlag(Crafter.ID);
});

Hooks.on('renderJournalDirectory', Crafter.renderJournalDirectory);

  Hooks.once('ready', () => {
    Crafter.initialize();
    game.packs.get('crafter.crafter-components').getIndex({fields: ['name', 'img', 'data.rarity']});
    
  });


  async function testPromise(options = [], prompt = ``, count){
    return new Promise((resolve) => {
      let dialog_options = (options[0] instanceof Array)
        ? options.map(o => `<option class="crafter-item-list" value="${o[0]}" index="${o[0]}" name="${o[0]}">${o[0]}</option>`).join(``)
        : options.map(o => `<option class="crafter-item-list" value="${o}" index="${o}" name="${o}"><b>${o}</b></option>`).join(``);
       // <a class ="item-create " name= "${o[0]}" type="selectedItem"><li class="crafter-select-option-selected" value="${o[0]}" index="${o[0]}" name="${o[0]}"><b>${o[0]}</b></li></a>
      let content = `
      <head>

    <script type="text/javascript">
window.onmousedown = function (e) {
    var el = e.target;
    if (el.tagName.toLowerCase() == 'option' && el.parentNode.hasAttribute('multiple')) {
        e.preventDefault();

        // toggle selection
        if (el.hasAttribute('selected')) el.removeAttribute('selected');
        else el.setAttribute('selected', '');

        // hack to correct buggy behavior
        var select = el.parentNode.cloneNode(true);
        el.parentNode.parentNode.replaceChild(select, el.parentNode);
    }
}
        
    </script>

</head>
      <table style="width=100%">
        <tr><th>${prompt} ${count}</th></tr>
        <tr><td><select id="choice" style="crafter-item-list"  size="10" multiple="multiple">
        ${dialog_options}
        </select></td></tr>
      </table>`;
    
      new Dialog({
        content, 
        buttons : { OK : {label : `OK`, callback : async (html) => { resolve(html.find('#choice').val()); } } }
      }).render(true);
    });
  }


 




// book- name of actor to be used as Receipe book, targetItem name of Item to be transformed
async function createRecipe(book, targetItem, materialType, profession, time, difficulty){
       
    let protoItem  = duplicate(game.items.getName(targetItem));
    book = game.actors.getName(book);
    await book.createEmbeddedDocuments("Item", [protoItem]);
    let item = book.data.items.find(i=>i.name === targetItem);
    
    let updates = {
            _id: item.id,
            name: "(Recipe)" + item.name,
            data: {
                description: {
                    value: item.data.data.description.value + RecipeData.recipeTagger(profession, time, difficulty, materialType)
                }
            }
        }

    await book.updateEmbeddedDocuments("Item",[updates]);
    return item;
    }

async function craftFromRecipe(bookName, crafterName, recipeName) {
    let book = game.actors.getName(bookName);
    let crafter = game.actors.getName(crafterName);
    let recipe = book.data.items.getName(recipeName);
    let desc = recipe.data.data.description.value;
    desc = desc.substring(0, desc.indexOf(RecipeData.RECIPE));
    let name =recipe.name.substring(8);
    let protoItem = duplicate(recipe);
    protoItem._id = foundry.utils.randomID(16);
    protoItem.name = name;
    protoItem.data.description.value = desc;
   
   let item = await crafter.createEmbeddedDocuments("Item", [protoItem]); 

   return item;
    }

async function log(force, ...args) {
    const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(Crafter.ID);

    if (shouldLog) {
        console.log(Crafter.ID, '|', ...args);
    }
    }


class ProgressTracker{

    static checkProgress(crafterName, bookName, recipeName){
        let crafter = game.actors.getName(crafterName);
        let book = game.actors.getName(bookName);
        let recipe = book.data.items.getName(recipeName);
        let flag =  recipe.getFlag(Crafter.ID, crafter.id);
        if (flag !=  undefined){
        return flag;
        }else{
            return 0;
        }


    }
    //Crafter "Name", Book "Name", Recipe "Name"
    static async setProgress(crafterName, bookName, recipeName, incPer){
        let crafter = game.actors.getName(crafterName);
        let book = game.actors.getName(bookName);
        let recipe = book.data.items.getName(recipeName);
        let flag = await recipe.getFlag(Crafter.ID, crafter.id);
        if(flag == undefined){
            flag =0;
        }
        await recipe.setFlag(Crafter.ID, crafter.id, flag+incPer);
        flag = await recipe.getFlag(Crafter.ID, crafter.id);
        if (flag >=100){
            Crafter.log(false, flag + " | 100%");
            await recipe.unsetFlag(Crafter.ID, crafter.id);
            return 100;

        }else{
            Crafter.log(false, flag + " | less than 100");
        return flag+incPer;
        } 
    }

    







}

class CraftingMenu extends FormApplication{
    
    static get defaultOptions() {

        const defaults = super.defaultOptions;
        let overrides = {
            closeOnSubmit: false,
            submitOnChange: true,
            height: '1010',
            width: '600',
            resizable: true,
            id: 'crafter',
            template: Crafter.TEMPLATES.CRAFTING,
            title: 'Crafting Menu',
            scrollY: [
                ".crafter-item-list"
              ],

        }
        if (Crafter.craftingMenu == undefined){
            overrides = foundry.utils.mergeObject(this.SetInitials(), overrides);
        }
        
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;

    }
    
    //Sends Data to the Crafting Form
    getData(options) {
        Crafter.log(false, "Get Data")
        
       let parsedItem = RecipeData.recipeParser("TestBook", options.currentItem);
       let prog = ProgressTracker.checkProgress("TestCrafter", options.currentBook, options.currentItem); 
        return {
            //-------Form Lists Attributes--------
            item: RecipeData.recipeItemFromName(options.currentBook, options.currentItem),
            books: RecipeData.findBooks("Book"),
            recipies: RecipeData.findRecipes(options.currentBook, "(Recipe)"),
            //-------Recipe Attributes--------
            profession: parsedItem.profession,
            components: parsedItem.components,
            time: parsedItem.time,
            difficulty: parsedItem.difficulty,
            baseDesc: parsedItem.baseDesc,
            currentItemRaw: options.currentItem.slice(8),
            //-------Selections--------
            currentItem: options.currentItem,
            currentBook: options.currentBook,
            recipeIndex: options.recipeIndex,
            progress: prog,
        
         
        
            
            
        }
        
    }  
    activateListeners(html) {
        super.activateListeners(html);
        html.on('click', "[data-action]", this._handleButtonClick.bind(this));


        
        html.find('.item-create ').click(ev => {
            log(false, "ev.currentTarget.target "+ev.currentTarget.target+ " | ev.currentTarget.name "+ev.currentTarget.name);
            this._handleButtonClick(ev);
          });

          html.find('.crafter-craft-button ').click(ev => {
            log(false, "ev.currentTarget.target "+ev.currentTarget.target+ " | ev.currentTarget.name "+ev.currentTarget.name);
            this._handleButtonClick(ev);
          });  

      }
      
      
    //-------Handles updating options data --------
    //-------Is called on form Change--------
    async _updateObject(event, formData) {

        this.render();


    }
    
    async _handleButtonClick (event){
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

               // Crafter.log(false, event);
               if (event.type === "click"){
                const caller = event.currentTarget.type;
                switch(caller){
                    case 'bookName':{
                        this.options.currentBook = event.currentTarget.name;
                        this.options.currentItem = RecipeData.findRecipes(event.currentTarget.name, "(Recipe)")[0];
                        this.options.recipeIndex = 0;
                        this.render();
                        break;
                    }
                    case 'selectedItem':{
                        if(event.target.value == this.options.currentBook){
                            break;
                        }
                        let parsedItem = RecipeData.recipeParser(this.options.currentBook, event.currentTarget.name);
              
                        const updates = {
                            currentItem: event.currentTarget.name,
                            recipeIndex: parseInt(event.currentTarget.id),
                            profession: parsedItem.profession,
                            components: parsedItem.components,
                            componentsNum: parsedItem.componentsNum,
                            time: parsedItem.time,
                            difficulty: parsedItem.difficulty,
                            baseDesc: parsedItem.baseDesc,
                            currentItemRaw: String(event.currentTarget.name).slice(8),
                        }
                        foundry.utils.mergeObject(this.options, updates);
                   
                        this.render();
                        break;
                        
                    }
                    case 'craft':{
                        await this.CraftRecipe();

                        this.render();
                    
            
                     } 
                    
                    default:{
                    }
                }
            }
         
       
    }  


    async CraftRecipe() {
                
        Crafter.craftingMenu.options.compInv = [];
        let k = true;
        let c = false;
        let compNameA = Crafter.craftingMenu.options.components;
        //let compInv = Crafter.craftingMenu.options.components;
        let crafterInv = [];
        let recipeInv = this.options.componentsNum.slice();
        
        //------ Checks if Valid Craft --------
        for (let i = 0; i < compNameA.length; i++) {
           crafterInv.push(RecipeData.compCount(compNameA[i]));
        }
            for (let i = 0; i < recipeInv.length; i++) {
                    c=false
                if (crafterInv[i] >= recipeInv[i]) {
                    c = true;  
                }
                k= (c&&k)    
        }
        if (k== true) {
        // ----- begin Crafting Logic -------

                let que = [];
                for (let i = 0; i < recipeInv.length; i++) {
                    
                    let protoQue = [];
                    while (protoQue.length !=recipeInv[i]){
                     protoQue = await testPromise(RecipeData.unpackComp("TestCrafter", compNameA[i]), "Select Components", recipeInv[i])
                    }
                   
                   
                   
                    for (let j = 0; j < protoQue.length; j++) {
                        que.push(protoQue[j]);
                        
                    }
                    
                }
               let actor = game.actors.getName("TestCrafter");
                for (let i = 0; i < que.length; i++) {
                    let comp = actor.items.getName(que[i]);
                
                        const updates = [{_id: comp.id, data: { quantity: comp.data.data.quantity -1 } }];
                       
                        const updated = await game.actors.getName("TestCrafter").updateEmbeddedDocuments("Item", updates);
                    //    currentItem.data.data.quantity-=1;
                        if (comp.data.data.quantity == 0){
                            await game.actors.getName("TestCrafter").deleteEmbeddedDocuments("Item", [comp.id]);
                        }

                    }

                    let item = craftFromRecipe(Crafter.craftingMenu.options.currentBook, "TestCrafter", Crafter.craftingMenu.options.currentItem);
                    //---Progress Setting
                    await ProgressTracker.setProgress("TestCrafter",Crafter.craftingMenu.options.currentBook, Crafter.craftingMenu.options.currentItem, 20);
                    Crafter.craftingMenu.options.progress = ProgressTracker.checkProgress("TestCrafter", Crafter.craftingMenu.options.currentBook, Crafter.craftingMenu.options.currentItem);

            
        }



    }
//-------Sets the initial options data-------
//-------Should only be run once--------
    static SetInitials(){
        
        let iBook = RecipeData.findBooks("Book");
        let iRecipe = RecipeData.findRecipes(iBook[0], "(Recipe)");
        let parsedItem = RecipeData.recipeParser(iBook[0],iRecipe[0]);


        const overrides = {
           
             //-------Form Lists Attributes--------
             item: RecipeData.recipeItemFromName(iBook[0], iRecipe[0]),
             books: iBook,
             recipies: iRecipe,
             compInv: [],
             //-------Recipe Attributes--------
             profession: parsedItem.profession,
             components: parsedItem.components,
             componentsNum: parsedItem.componentsNum,
             time: parsedItem.time,
             difficulty: parsedItem.difficulty,
             baseDesc: parsedItem.baseDesc,
             currentItemRaw: iRecipe[0].slice(8),
             //-------Selections--------
             currentItem: iRecipe[0],
             currentBook: iBook[0],
             recipeIndex: 0,


        }
        return overrides;

    }

}

class RecipeMenu extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;
      //  let bookArr = RecipeData.findBooks("Book");
        const overrides = {
            closeOnSubmit: false,
            height: '700',
            width: '500',
            id: 'crafter',
            submitOnChange: true,
            template: Crafter.TEMPLATES.RECIPE,
            title: 'Recipe Menu',
            currentItem: 'Potion of Healing',
            
        
       //     books: bookArr,
        
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;

    }
    getData(options) {
        return {
            item: RecipeData.itemFromName(this.currentItem),
            books: RecipeData.findBooks("Book"),

        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
      }
    

    async _updateObject(event, formData) {
        Crafter.log(false, event);
        if (event.type === "submit") {
            const caller = event.submitter.value;
            switch (caller) {
                case 'changeItem': {
                    this.currentItem = formData.submitText;
                    this.render();
                    break;
                }
                case 'createRecipe': {
                    Crafter.log(false, "Creating Recipe", formData)
                    if (formData.bookName && this.currentItem) {
                        Crafter.log(false, "Crafting is Ready");
                        ui.notifications.info("Crafting Recipe for "+this.currentItem + " on Book "+ formData.bookName);
                        createRecipe(formData.bookName, this.currentItem, formData.material, formData.profession, formData.time, formData.difficulty);
                    } else {
                        Crafter.log(false, "Crafting Failed", formData.bookName, this.currentItem.name)
                    }

                    break;
                }
                default:
            }
        }




    }

    async _handleButtonClick (event){
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;
       // const toDoId = clickedElement.parents('[data-todo-id]')?.data()?.todoId;
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

class ProxyMenu extends FormApplication{
    
    static get defaultOptions() {

        const defaults = super.defaultOptions;
        let overrides = {
            closeOnSubmit: false,
            submitOnChange: true,
            height: '500',
            width: '400',
            resizable: true,
            id: 'crafter-proxy',
            template: Crafter.TEMPLATES.PROXY,
            title: 'Material Selection',
            scrollY: [
                ".crafter-item-list"
              ],

        }
        // if (Crafter.craftingMenu == undefined){
        //     overrides = foundry.utils.mergeObject(this.SetInitials(), overrides);
        // }
        
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;

    }
    
    //Sends Data to the Crafting Form
    getData(options) {
        Crafter.log(false, "Proxy Menu")
        
       
        return {
            //-------Form Lists Attributes--------
            // item: RecipeData.recipeItemFromName(options.currentBook, options.currentItem),
            // books: RecipeData.findBooks("Book"),
            // recipies: RecipeData.findRecipes(options.currentBook, "(Recipe)"),
            // //-------Recipe Attributes--------
            // profession: parsedItem.profession,
             components: game.items,
            // time: parsedItem.time,
            // difficulty: parsedItem.difficulty,
            // baseDesc: parsedItem.baseDesc,
            // currentItemRaw: options.currentItem.slice(8),
            // //-------Selections--------
            // currentItem: options.currentItem,
            // currentBook: options.currentBook,
            // recipeIndex: options.recipeIndex,
            // progress: prog,
        
         
        
            
            
        }
        
    }  
    activateListeners(html) {
        super.activateListeners(html);
        html.on('click', "[data-action]", this._handleButtonClick.bind(this));


        
        // html.find('.item-create ').click(ev => {
        //     log(false, "ev.currentTarget.target "+ev.currentTarget.target+ " | ev.currentTarget.name "+ev.currentTarget.name);
        //     this._handleButtonClick(ev);
        //   });

        //   html.find('.crafter-craft-button ').click(ev => {
        //     log(false, "ev.currentTarget.target "+ev.currentTarget.target+ " | ev.currentTarget.name "+ev.currentTarget.name);
        //     this._handleButtonClick(ev);
        //   });  

      }
      
      
    //-------Handles updating options data --------
    //-------Is called on form Change--------
    async _updateObject(event, formData) {

        this.render();


    }
    
    async _handleButtonClick (event){
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

               // Crafter.log(false, event);
            //    if (event.type === "click"){
            //     const caller = event.currentTarget.type;
            //     switch(caller){
            //         case 'bookName':{
            //             this.options.currentBook = event.currentTarget.name;
            //             this.options.currentItem = RecipeData.findRecipes(event.currentTarget.name, "(Recipe)")[0];
            //             this.options.recipeIndex = 0;
            //             this.render();
            //             break;
            //         }
            //         case 'selectedItem':{
            //             if(event.target.value == this.options.currentBook){
            //                 break;
            //             }
            //             let parsedItem = RecipeData.recipeParser(this.options.currentBook, event.currentTarget.name);
              
            //             const updates = {
            //                 currentItem: event.currentTarget.name,
            //                 recipeIndex: parseInt(event.currentTarget.id),
            //                 profession: parsedItem.profession,
            //                 components: parsedItem.components,
            //                 componentsNum: parsedItem.componentsNum,
            //                 time: parsedItem.time,
            //                 difficulty: parsedItem.difficulty,
            //                 baseDesc: parsedItem.baseDesc,
            //                 currentItemRaw: String(event.currentTarget.name).slice(8),
            //             }
            //             foundry.utils.mergeObject(this.options, updates);
                   
            //             this.render();
            //             break;
                        
            //         }
            //         case 'craft':{
            //             await this.CraftRecipe();

            //             this.render();
                    
            
            //          } 
                    
            //         default:{
            //         }
            //     }
            // }
         
       
    }  


//-------Sets the initial options data-------
//-------Should only be run once--------
    static SetInitials(){
        
        let iBook = RecipeData.findBooks("Book");
        let iRecipe = RecipeData.findRecipes(iBook[0], "(Recipe)");
        let parsedItem = RecipeData.recipeParser(iBook[0],iRecipe[0]);


        const overrides = {
           
             //-------Form Lists Attributes--------
             item: RecipeData.recipeItemFromName(iBook[0], iRecipe[0]),
             books: iBook,
             recipies: iRecipe,
             compInv: [],
             //-------Recipe Attributes--------
             profession: parsedItem.profession,
             components: parsedItem.components,
             componentsNum: parsedItem.componentsNum,
             time: parsedItem.time,
             difficulty: parsedItem.difficulty,
             baseDesc: parsedItem.baseDesc,
             currentItemRaw: iRecipe[0].slice(8),
             //-------Selections--------
             currentItem: iRecipe[0],
             currentBook: iBook[0],
             recipeIndex: 0,


        }
        return overrides;

    }

}