// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  Drop Down Menu has a functionality similar to that of SelectField

  Clicking the DropDownMenu button displays a menu pane with a
  list of items. The selected item will be displayed on the button.

  @extends SC.ButtonView
  @version 1.0
  @author Mohammed Ashik
*/
sc_require('views/button');

SC.DropDownMenu = SC.ButtonView.extend(
/** @scope SC.DropDownMenu.prototype */ {

  /**
    An array of items that will form the menu you want to show.

    @property
  */
  objects: [],

  /**
    Binding default for an array of objects

    @property
  */
  objectsBindingDefault: SC.Binding.multiple(),

  /**
    If you set this to a non-null value, then the name shown for each
    menu item will be pulled from the object using the named property.
    if this is null, the collection objects themselves will be used.

    @property
  */
  nameKey: null,

  /**
    If you set this to a non-null value, then the value of this key will
    be used to sort the objects.  If this is not set, then nameKey will
    be used.

    @property
  */
  sortKey: null,

  /**
     Set this to a non-null value to use a key from the passed set of objects
     as the value for the options popup.  If you don't set this, then the
     objects themselves will be used as the value.

     @property
  */
  valueKey: null,

  /**
    if true, the empty name will be localized.

    @property
  */
  localize: false,

  /**
    if true, it means that no sorting will occur, objects will appear
    in the same order as in the array

    @property
  */
  disableSort: NO,

  /**
    className - sc-popup-button

    @property
  */
  classNames: ['drop-down-menu'],

  /**
    Menu item list

    @property
    @type:{SC.Array}
  */
  itemList: [],

  /**
    Current selected menu item

    @property
  */
  currentSelItem: null,

  /**
    To set the menu item index

    @property
  */
  itemIdx: null,

  /**
     Current Value of the dropDown

     @property
  */
  value: null ,

  /**
    Binds the button's title to the 'value'

    @property
  */
  titleBinding: '*.value',

  /**
    Default selected value of the drop down.
     This will be the first item from the menu item list.

    @private
  */
  _defaultSelVal: null,

  /**
    Prefer matrix to position the drop down menu the button such that the
    selected item for the menu item will appear aligned to the
    icon on the button.

    @property
    @default [ 2, 0. 2]

  */
  preferMatrix: [2, 0, 2],

  /**
    Binds the button's selection state to the menu's visibility.
    @private
  */
  isSelectedBinding: '*menu.isVisibleInWindow',

  /**
    override this method to implement your own sorting of the menu. By
    default, menu items are sorted using the value shown or the sortKey

    @param{SC.Array} objects the unsorted array of objects to display.
    @returns sorted array of objects
  */
  sortObjects: function(objects) {
    if(!this.get('disableSort')){
      var nameKey = this.get('sortKey') || this.get('nameKey') ;
      objects = objects.sort(function(a,b) {
        if (nameKey) {
          a = a.get ? a.get(nameKey) : a[nameKey] ;
          b = b.get ? b.get(nameKey) : b[nameKey] ;
        }
        return (a<b) ? -1 : ((a>b) ? 1 : 0) ;
      }) ;
    }
    return objects ;
  },

  /**
    render method

    @private
  */
  render: function(context,firstTime) {
    var objects = this.get('objects') ;
    objects = this.sortObjects(objects) ;

    //Get the namekey, iconKey and valueKey set by the user
    var nameKey = this.get('nameKey') ;
    var iconKey = this.get('iconKey') ;
    var valueKey = this.get('valueKey') ;

    // get the localization flag.
    var shouldLocalize = this.get('localize');

    //itemList array to set the menu items
    var itemList = [];

    //to set the 'checkbox' property of menu items
    var isChecked = YES ;

    //index for finding the first item in the list
    var idx = 0 ;

    objects.forEach(function(object) {
    if (object) {

      //Get the name value. If value key is not specified convert obj
      //to string
      var name = nameKey ? (object.get ?
        object.get(nameKey) : object[nameKey]) : object.toString() ;

      // localize name if specified.
      if(shouldLocalize)
      {
        name = name.loc();
      }

      // get the value using the valueKey or the object if no valueKey.
      // then convert to a string or use _guid if one of available.
      var value = (valueKey) ? (object.get ?
        object.get(valueKey) : object[valueKey]) : object ;

      //Check if the item is currentSelectedItem or not
      if(name === this.value) {

        //set the itemIdx - To change the prefMatrix accordingly.
        this.set('itemIdx', idx) ;
        isChecked = YES ;
      }
      else {
        isChecked = NO ;
      }

      //Get the icon value
      var icon = iconKey ? (object.get ?
        object.get(iconKey) : object[iconKey]) : null ;
      if (SC.none(object[iconKey])) {
         icon = null ;
      }

      //Set the first item from the list as default selected item
      if (idx === 0) {
        this._defaultSelVal = name ;
        this.set('icon', icon) ;
      }

      //Set the items in the itemList array
      itemList.push({
        title: name,
        icon: icon,
        isEnabled: YES,
        checkbox: isChecked,
        action: this.displaySelectedItem
      });
    }
         idx += 1 ;

        this.set('itemList', itemList) ;
     }, this ) ;

    if(firstTime) {
      var selectionValue = this.get('selectionValue') ;
      if(!SC.none(selectionValue)) {
        this.set('value', selectionValue) ;
      }
      else {
        this.set('value', this._defaultSelVal) ;
      }
    }

    //Set the preference matrix for the menu pane
    this.changeDropDownPreferMatrix(this.itemIdx);

    var menu = this.get('menu') ;
    if(firstTime && menu) {
      menu.createLayer() ;
    }
    sc_super() ;
  },

  /**
    Button action handler

    @private
    @param {DOMMouseEvent} evt mouseup event that triggered the action
  */
  _action: function( evt )
  {
    var width = this.get('layer').offsetWidth ;
    var currSel = this.get('currentSelItem') ;
    var itemList = this.get('itemList') ;
    var menu = SC.MenuPane.create({

      /**
        Class name - drop-down-menu-item

      */
      classNames: ['drop-down-menu-item'],

      /**
        The menu items are set from the itemList property of DropDownMenu

        @property
      */
      items: itemList,

      /**
        This property enables all the items and makes them selectable.

        @property
      */
      isEnabled: YES,

      preferType: SC.PICKER_MENU,
      itemHeightKey: 'height',
      layout: { width: width },
      contentView: SC.View.extend({
      })
    }) ;

    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.popup(this, this.preferMatrix) ;
    menu.set('currentSelectedMenuItem', currSel) ;
    return YES;
  },

  /**
    @private

    The button theme will be popup
  */
  theme: 'popup',

  /**
    Render method gets triggered when these properties change

    @property
    @type{SC.Array}
  */
  displayProperties: ['icon', 'title'],

  /**
     Action method for the drop down menu items

  */
  displaySelectedItem: function() {

    //Get MenuPane, currentSelectedMenuItem & menuItemView
    var menuView = this.get('parentView') ;
    var currSel = menuView.get('currentSelectedMenuItem') ;
    var itemViews = menuView.menuItemViews ;

    /**
      Fetch the index of the current selected item
    */
    var itemIdx = 0 ;
    if (currSel && itemViews) {
      itemIdx = itemViews.indexOf(currSel) ;
    }

    //Get the drop down View
    var button = this.getPath('parentView.anchor') ;

    //Set the button title and icon
    button.set('title', this.get('value')) ;
    button.set('icon', this.get('icon')) ;

    //Set value, currentSelectedItem & itemIdx
    button.set('value', this.get('value')) ;
    button.set('currentSelItem', currSel) ;
    button.set('itemIdx', itemIdx) ;
  },

  /**
     Set the "top" attribute in the prefer matrix property which will
     position menu such that the selected item in the menu will be
     place aligned to the item on the button when menu is opened.
  */
  changeDropDownPreferMatrix: function() {
    var preferMatrixAttributeTop = 0;
    var itemIdx = this.get('itemIdx') ;

    //Set the preferMatrixAttribute Top
    if(itemIdx)
      preferMatrixAttributeTop = itemIdx * 20;

    if(this.get('preferMatrix'))
      this.get('preferMatrix')[1] = -preferMatrixAttributeTop ;
  }
}) ;
