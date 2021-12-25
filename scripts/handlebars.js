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

    if (game.items.getName(value) || RecipeData.compfromPack(value)[0]) {
       if (RecipeData.compfromPack(value)[0]){
           return RecipeData.compfromPack(value)[0].img;
        }else if (game.items.getName(value))
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

    if (game.items.getName(value)|| RecipeData.compfromPack(value)[0]) {
        let color;
        if (RecipeData.compfromPack(value)[0]!=undefined){
            color = RecipeData.compfromPack(value)[0].data.rarity;
        }else {
            color = game.items.getName(value).data.data.rarity;
        }
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

