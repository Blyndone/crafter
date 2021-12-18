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
    // static setInitialFormData(craftingMenu){
    //     this.craftingMenu.formData = {
    //         item: RecipeData.itemFromName("Potion of Healing"),
    //         books: RecipeData.findBooks("Book"),
    //         recipies: RecipeData.findRecipes("TestBook", "(Recipe)"),
    //         bookName: "TestBook",
    //     }
    //     Crafter.log(false, craftingMenu.formData)
    // }




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
              //   Crafter.setInitialFormData(Crafter.craftingMenu);
                Crafter.craftingMenu.render(true); 
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
async function createRecipe(book, targetItem, materialType, profession, time, difficulty){
    //let tempTag = ['Curative', 'Plant', 'Healing'];
    
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
    static recipeItemFromName(book, name) {
        
        return game.actors.getName(book).items.getName(name)
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
    static findBooks(key){
        let bookObj = game.actors.filter(i =>i.name.includes(key))
        let books = [];
        for (let i = 0; i < bookObj.length; i++){             
        books.push(bookObj[i].name);
        }
        return books;
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

    static recipeTagger(professionType, craftingTime, difficulty, component){
       /*  let build = [];
        build.push(this.RECIPE);
        build.push(component);
        build.push(professionType);
        build.push(craftingTime);
        build.push(difficulty);
  
        let tags = "";
        for (let i = 0; i < build.length; i++) {
            tags = tags.concat(build[i]);
            
        } */
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
    //takes in book actor name and recipe item name
    static recipeParser(book, item){
        book = game.actors.getName(book);
        item = book.data.items.getName(item);
        let desc = item.data.data.description.value;
        let component =  desc.substring(desc.indexOf(this.COMPONENT)+this.COMPONENT.length+6,desc.indexOf(this.TIME)-6),
        comp = component.split('|')
        let parsedItem = {
            name: item.name,
            book: book.name,
            profession: desc.substring(desc.indexOf(this.PROFESSION)+this.PROFESSION.length+6,desc.indexOf(this.COMPONENT)-6),
            component: comp,
            time: desc.substring(desc.indexOf(this.TIME)+this.TIME.length+6,desc.indexOf(this.DIFFICULTY)-6),
            difficulty: desc.substring(desc.indexOf(this.DIFFICULTY)+this.DIFFICULTY.length+6,desc.length -4),
            baseDesc: desc.substring(0, desc.indexOf(this.RECIPE))
            
        }
        Crafter.craftingMenu.options.recipeComponents = parsedItem.component;
        return parsedItem;

         //let prof =  desc.substring(desc.indexOf(this.PROFESSION)+this.PROFESSION.length+6,desc.indexOf(this.COMPONENT)-6);
        // let compon =  desc.substring(desc.indexOf(this.COMPONENT)+this.COMPONENT.length+6,desc.indexOf(this.TIME)-6);
        // let time =  desc.substring(desc.indexOf(this.TIME)+this.TIME.length+6,desc.indexOf(this.DIFFICULTY)-6);
        // let diff =  desc.substring(desc.indexOf(this.DIFFICULTY)+this.DIFFICULTY.length+6,desc.length -4);
         //desc.indexOf(this.PROFESSION)+this.PROFESSION.length;
       //  Crafter.log(false, pos1);
       //  Crafter.log(false, pos2);
       //  Crafter.log(false, pos3);
         //Crafter.log(false, pos4);
       



//<p><br />&lt;Recipe&gt;<br />&lt;Profession&gt;<br />Herbalism<br />&lt;Component&gt;<br />Healing Herb<br />&lt;Time&gt;<br />12 Hours<br />&lt;Difficulty&gt;<br />DC = 15</p>


    }




    

}



class CraftingMenu extends FormApplication{
    static get defaultOptions() {
        const defaults = super.defaultOptions;
     
        const overrides = {
            closeOnSubmit: false,
            submitOnChange: true,
            height: '850',
            width: '600',
            resizable: true,
            id: 'crafter',
            template: Crafter.TEMPLATES.CRAFTING,
            title: 'Crafting Menu',
            currentItem: '(Recipe)Potion of Healing',
            currentBook: "TestBook",
            recipeIndex: '0',
            profession: 'Test Prof',
            component: 'Test Comp',
            time: 'Test Time',
            difficulty: 'Test Diff',
            baseDesc: 'base desc',
            compInv: [],
            recipeComponents: [],
            
            
     
        };

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;

    }
    
    //initial and submit
    getData(options) {
        Crafter.log(false, "Get Data")
        let parsedItem = RecipeData.recipeParser(options.currentBook, options.currentItem);


        return {
            item: RecipeData.recipeItemFromName(options.currentBook, options.currentItem),
            books: RecipeData.findBooks("Book"),
            recipies: RecipeData.findRecipes(options.currentBook, "(Recipe)"),
            selectedBook: options.currentBook,
            recipeIndex: options.recipeIndex,
            profession: parsedItem.profession,
            component: parsedItem.component,
            time: parsedItem.time,
            difficulty: parsedItem.difficulty,
            baseDesc: parsedItem.baseDesc,
            currentItemRaw: options.currentItem.slice(8),
            currentItem: options.currentItem
        
            
            
        }
        
    }  
    activateListeners(html) {
        super.activateListeners(html);
        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
      }

    async _updateObject(event, formData) {
        Crafter.log(false, event);

        //switches the selected Item and book
        if (event.type === "change"){
            const caller = event.target.id;
            switch(caller){
                case 'changeBook':{
                    this.options.currentBook = event.target.value;
                    this.render();
                }
                case 'selectedItem':{
                    this.options.currentItem = event.target.value;
                    this.options.recipeIndex = event.target.selectedIndex;
                    this.render();
                }
                default:{
                }
            }
        }
     
        if (event.type === "submit") {
            const caller = event.submitter.value;
            switch (caller) {
               
                case 'changeItem': {
                    this.currentItem = formData.selectedItem;
                    this.recipies = RecipeData.findRecipes(formData.bookName, "(Recipe)")
                    this.render();
                    break;
                }
                case 'createRecipe': {
                    Crafter.log(false, "Creating Recipe", formData)
                    if (formData.bookName && this.currentItem) {
                        Crafter.log(false, "Crafting is Ready");
                        createRecipe(formData.bookName, this.currentItem, formData.material, formData.profession, formData.time, formData.difficulty);
                    } else {
                        Crafter.log(false, "Crafting Failed", formData.bookName, this.currentItem.name)
                    }

                    break;
                }
                case 'craft':{
                    let k = true;
                    let c = false;
                    for (let i = 0; i < this.options.recipeComponents.length; i++) {
                        c = false;
                        for (let j = 0; j < this.options.compInv.length; j++) {
                            if (this.options.recipeComponents[i] == this.options.compInv[j].name) {
                                c = true;
                                break;
                            }
                        }
                        k = (c && k);
                    }
                    if (k == true) {
                        ui.notifications.info("Craft  that Bitch!");
                        Crafter.log(false, k + " k value")
                    }
        
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

Handlebars.registerHelper('isselected', function (value) {

    value2 = Crafter.craftingMenu.options.recipeIndex;
    return value == value2;
  });
  
  Handlebars.registerHelper('eq', function (value, value2) {

    
    return value == value2;
  });

  Handlebars.registerHelper('complookupname', function (value) {
 
    if(game.items.getName(value)){

        let value2 = game.items.getName(value).name;
        Crafter.log(false,value2);
        return value2
    }else{
        return "Vial";
    }
    
    
  });
  
  isFunction = function(value) {
    return typeof value === 'function';
  };

  Handlebars.registerHelper('compcount', function (value) {

              if (game.actors.getName("TestCrafter") && game.actors.getName("TestCrafter").items.getName(value)) {
                  const inv = Crafter.craftingMenu.options.compInv;
                  const items = game.actors.getName("TestCrafter").items.filter(i => i.name == value);
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
                  return "0";
              }




   
  });



  Handlebars.registerHelper('complookupimg', function (value) {
 
    if(game.items.getName(value)){

        let value2 = game.items.getName(value).img;
        Crafter.log(false,value2);
        return value2
    }else{
        return "icons/sundries/books/book-clasp-spiral-green.webp";
    }
    
    
  });
  



  Handlebars.registerHelper("color", function (value) {
    if (isFunction(value)) {
        value = value.call(this);
      }

    if (value){
    let color = game.items.getName(value).data.data.rarity;
    switch(color)
    {
        case 'common':{
            return "grey";
        }
        case 'uncommon':{
            return "green";
        }
        case 'rare':{
            return "blue";
        }
        case 'veryRare':{
            return "purple";
        }
        case 'legendary':{
            return "orange";
        }
        case 'artifact':{
            return "hotpink"
        }
        default: {
            return "teal";
        }


    }
    }else{
    return  "black";
    }
    
    






    
  });

// Handlebars.registerHelper("HBTEST", function(object, key) {

//     switch (searchType){
//         case "allBooks":{
//             bookObj = game.actors.filter(i =>i.name.includes(key))
//             let books = [];
//             for (let i = 0; i < bookObj.length; i++){             
//             books.push(bookObj[i].name);
//             }
//             return books;
//         }
            
                
            
             
        
//         case "filterItems":{

//         }
//         default:{
//             return "No search available"
//         }
//     }

 
//   }); 
 