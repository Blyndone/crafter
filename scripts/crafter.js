console.log("Crafter || Active");
class Crafter {
    static ID = 'crafter';
    static TEMPLATES = {
        RECIPE: `modules/${this.ID}/templates/recipe.hbs`,
        CRAFTING: `modules/${this.ID}/templates/crafting.hbs`
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
     * 
     */

    
    static initialize() {
         this.recipeMenu = new RecipeMenu();
         this.craftingMenu = new CraftingMenu();
         
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
    
  });

 


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

async function craftFromRecipe(book, crafter, recipe) {
    book = game.actors.getName(book);
    crafter = game.actors.getName(crafter);
    recipe = book.data.items.getName(recipe);
    let desc = recipe.data.data.description.value;
    desc = desc.substring(0, desc.indexOf(RecipeData.RECIPE));
    let name =recipe.name.substring(8);
    let protoItem = duplicate(recipe);
    protoItem._id = foundry.utils.randomID(16);
    protoItem.name = name;
    protoItem.data.description.value = desc;
   
   let item = await crafter.createEmbeddedDocuments("Item", [protoItem]); 
    // await crafter.createEmbeddedDocuments("Item", [protoItem]);
    
    // let item = crafter.data.items.find(i=>i.name === recipe.name);
    
    // let updates = {
    //     _id: item._id,
    //     name: name,
    //     data: {
    //         description: {
    //             value: desc,
    //         },
            
    //     }
    // }
    // await crafter.updateEmbeddedDocuments("Item", [updates]);
    return item;
    }

async function log(force, ...args) {
    const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(Crafter.ID);

    if (shouldLog) {
        console.log(Crafter.ID, '|', ...args);
    }
    }

class RecipeData {
    static RECIPE = '&lt;Recipe&gt;';
    static PROFESSION = '&lt;Profession&gt;';
    static COMPONENT = '&lt;Component&gt;';
    static TIME = '&lt;Time&gt;';
    static DIFFICULTY = '&lt;Difficulty&gt;';


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
    static recipeCraftingCount(){
        let n =game.actors.getName(Crafter.craftingMenu.options.currentBook).items.getName(Crafter.craftingMenu.currentItem).data.data.quantity;
        if(n=1){
            return;
        }else{
            return n;
        }
        
    }
    static recipeItemFromName(book, name) {
        
        return game.actors.getName(book).items.getName(name)
    }

//-------In: Book name (String in name field, usually "Book") and returns an array of book names --------
    static findBooks(key){
        let bookObj = game.actors.filter(i =>i.name.includes(key))
        let books = [];
        for (let i = 0; i < bookObj.length; i++){             
        books.push(bookObj[i].name);
        }
        return books;
    }
 //-------In: Book name and key (String in name field, usually "(Recipe)") and returns an array of Recipe Names--------       
    static findRecipes(book, key){
        book = game.actors.getName(book);
        let multiObj = book.data.items.filter(item => (item.name).includes(key) );
        let multi = [];
        for (let i = 0; i< multiObj.length; i++){
            multi.push(multiObj[i].name)
        }
        multi.sort();
        return  multi;
 
        }   
//-------Takes in the Raw text for a recipe tag as separate strings, and returns a single string--------
    static recipeTagger(professionType, craftingTime, difficulty, component){

        let linebreak = "<br>";
        let tags = linebreak +
        this.RECIPE + 
        linebreak + this.PROFESSION + 
        linebreak + professionType +
        linebreak + this.COMPONENT + 
        linebreak + component + 
        linebreak + this.TIME +
        linebreak + craftingTime +
        linebreak + this.DIFFICULTY +
        linebreak + difficulty;



        return tags;

    }
    //-------Parses a Recipe and returns the key data as an object --------
    static recipeParser(book, item){
        book = game.actors.getName(book);
        item = book.data.items.getName(item);
        let desc = item.data.data.description.value;
        let component =  desc.substring(desc.indexOf(this.COMPONENT)+this.COMPONENT.length+6,desc.indexOf(this.TIME)-6);
        let comp = component.split('|');
        let compNum = [];
        for (let i = 0; i < comp.length; i++) {
            if (comp[i].includes('(')){
            compNum.push(parseInt(comp[i].substring(comp[i].indexOf('(')+1,comp[i].indexOf(')'))  ));
            comp[i]=comp[i].replace((comp[i].substring(comp[i].indexOf('('),comp[i].indexOf(')')+1)), "");
            }else {
                compNum.push(1);
            }
            
        }
        let parsedItem = {
            name: item.name,
            book: book.name,
            profession: desc.substring(desc.indexOf(this.PROFESSION)+this.PROFESSION.length+6,desc.indexOf(this.COMPONENT)-6),
            components: comp,
            componentsNum: compNum,
            time: desc.substring(desc.indexOf(this.TIME)+this.TIME.length+6,desc.indexOf(this.DIFFICULTY)-6),
            difficulty: desc.substring(desc.indexOf(this.DIFFICULTY)+this.DIFFICULTY.length+6,desc.length -4),
            baseDesc: desc.substring(0, desc.indexOf(this.RECIPE))
            
        }
        
        return parsedItem;


    }
    //-------Counts the quantity of a single component in an inventory--------
static compCount(value){
    let proxy = this.findProxy(value);
    const inv = Crafter.craftingMenu.options.compInv;
              if (game.actors.getName("TestCrafter") && (game.actors.getName("TestCrafter").items.getName(value)) != undefined || proxy!= null) {
                
                  const items = game.actors.getName("TestCrafter").items.filter(i => i.name == value);
                  if (proxy!= null){
                      for (let i = 0; i < proxy.length; i++) {
                          items.push(proxy[i]);                          
                      }
                  }
                  let p = true;

                  for (let i = 0; i < items.length; i++) {
                      p = true;
                      for (let j = 0; j < inv.length; j++) {
                          if (inv[j].id == items[i].id) {
                              p = false;
                          }
                      }
                      if (p != false) {
                          Crafter.craftingMenu.options.compInv.push(items[i])
                      }
                  }

                  let num = 0;
                  for (let i = 0; i < items.length; i++) {
                      num += items[i].data.data.quantity;
                  }
                  
                  return num;

              } else {
                  return 0;
              }

            }
static findProxy(value){
    let proxy = game.actors.getName("TestCrafter").items.filter(i=>i.data.data.description.value.includes("#"+value+"#"));
    if (proxy.length>0){
        return proxy;
    }else {
        return null;
    }
        
}
    

}

class ProgressTracker{

    static checkProgress(crafter, book, recipe){
        crafter = game.actors.getName(crafter);
        book = game.actors.getName(book);
        recipe = book.data.items.getName(recipe);
        let flag =  recipe.getFlag(Crafter.ID, crafter.id);
        if (flag !=  undefined){
        return flag;
        }else{
            return 0;
        }


    }
    //Crafter "Name", Book "Name", Recipe "Name"
    static async setProgress(crafter, book, recipe, incPer){
        crafter = game.actors.getName(crafter);
        book = game.actors.getName(book);
        recipe = book.data.items.getName(recipe);
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
                    //     Crafter.craftingMenu.options.compInv =[];
                        
                    //     let k = true;
                    //     let c = false;



                    //     for (let i = 0; i < this.options.components.length; i++) {
                    //         RecipeData.compCount(this.options.components[i]);
                            
                    //     }
                    //     for (let i = 0; i < this.options.components.length; i++) {
                    //         c = false;
                    //         for (let j = 0; j < this.options.compInv.length; j++) {
                    //             if (this.options.components[i] == this.options.compInv[j].name) {
                    //                 c = true;
                    //                 break;
                    //             }
                    //         }
                    //         k = (c && k);
                    //     }
                    //     if (k == true) {
                    //         ui.notifications.info("Craft  that Bitch!");
                    //         Crafter.log(false, k + " k value");
                    //         let item = craftFromRecipe(Crafter.craftingMenu.options.currentBook,  "TestCrafter", Crafter.craftingMenu.options.currentItem);
                          
                    //             ui.notifications.info("Delete that shit" + item);
                    //             Crafter.log(false, item);
    
                    //             for (let i = 0; i < this.options.components.length; i++) {


                                    
                                    
                    //                 await game.actors.getName("TestCrafter").deleteEmbeddedDocuments("Item", [game.actors.getName("TestCrafter").items.getName(this.options.components[i]).id]); 
                                



                    //             Crafter.log(false, "Deleting "+ this.options.components[i])
                    
                    //              this.render();
    
    
    
                    //         }
                    //     }
                    //     break;
            
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
        let components = Crafter.craftingMenu.options.components;
        let compInv = Crafter.craftingMenu.options.components;
        let crafterInv = [];
        let recipeInv = this.options.componentsNum.slice();
        for (let i = 0; i < components.length; i++) {
           crafterInv.push(RecipeData.compCount(components[i]));
        }

      
            for (let i = 0; i < recipeInv.length; i++) {
                    c=false
                if (crafterInv[i] >= recipeInv[i]) {
                    c = true;
                    
                }
                k= (c&&k)    
            
        }
        if (k== true) {

            let item = craftFromRecipe(Crafter.craftingMenu.options.currentBook, "TestCrafter", Crafter.craftingMenu.options.currentItem);
            await ProgressTracker.setProgress("TestCrafter",Crafter.craftingMenu.options.currentBook, Crafter.craftingMenu.options.currentItem, 20);
            Crafter.craftingMenu.options.progress = ProgressTracker.checkProgress("TestCrafter", Crafter.craftingMenu.options.currentBook, Crafter.craftingMenu.options.currentItem);
            if(item){

            for (let i = 0; i < recipeInv.length; i++) {
                while(recipeInv[i] >0){
                    let currentItem;
                    if (RecipeData.findProxy(components[i])==null){
                        currentItem = game.actors.getName("TestCrafter").data.items.getName(components[i]);
                    }else{
                        currentItem = RecipeData.findProxy(components[i])[0];
                    }   
                       
                       
                        const updates = [{_id: currentItem.id, data: { quantity: currentItem.data.data.quantity -1 } }];
                       
                       
                       
                       
                        const updated = await game.actors.getName("TestCrafter").updateEmbeddedDocuments("Item", updates);


                    //    currentItem.data.data.quantity-=1;
                        recipeInv[i]-=1;
                        if (currentItem.data.data.quantity == 0){
                            await game.actors.getName("TestCrafter").deleteEmbeddedDocuments("Item", [currentItem.id]);
                        }

                    }



       
                }



            }
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


//-------Handlebars Helpers--------
isFunction = function (value) {
    return typeof value === 'function';
};

//-------Counts the number of a given component in Crafters inventory--------
Handlebars.registerHelper('compcount', function (value) {
    return RecipeData.compCount(value);

});

//-------Returns the number of required components in the recipe for a single component--------
Handlebars.registerHelper('compneededcount', function (index) {
    if(Crafter.craftingMenu.options.componentsNum== undefined){
        return "1";
    }else{
        return Crafter.craftingMenu.options.componentsNum[index];
    }

});

//-------Small function to help with table formatting--------
//-------Used to wrap <td> elements--------
Handlebars.registerHelper('numberofcomps2', function (value) {
    return value.length==2;

});

//-------Returns individual images for componenets--------
Handlebars.registerHelper('complookupimg', function (value) {

    if (game.items.getName(value)) {
        return game.items.getName(value).img;
    } else {
        return "icons/sundries/books/book-clasp-spiral-green.webp";
    }
});



//-------Used to set the border color for compoenents, and items--------
Handlebars.registerHelper("color", function (value) {
    if (isFunction(value)) {
        value = value.call(this);
    }

    if (game.items.getName(value)!=undefined) {
        let color = game.items.getName(value).data.data.rarity;
        switch (color) {
            case 'common': {
                return "grey";
            }
            case 'uncommon': {
                return "green";
            }
            case 'rare': {
                return "blue";
            }
            case 'veryRare': {
                return "purple";
            }
            case 'legendary': {
                return "orange";
            }
            case 'artifact': {
                return "hotpink"
            }
            default: {
                return "teal";
            }

        }
    } else {
        return "black";
    }

});

