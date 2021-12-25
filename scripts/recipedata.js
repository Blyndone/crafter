class RecipeData {
    static RECIPE = '&lt;Recipe&gt;';
    static PROFESSION = '&lt;Profession&gt;';
    static COMPONENT = '&lt;Component&gt;';
    static TIME = '&lt;Time&gt;';
    static DIFFICULTY = '&lt;Difficulty&gt;';




    static compfromPack(name){
       return game.packs.get('world.crafter-components').index.filter(i => i.name === name);
    }



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
