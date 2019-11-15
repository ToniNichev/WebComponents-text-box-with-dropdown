
var template = `
<style>
  .wrapper {
    display: inline-grid;
  }
  #drawer {
    cursor: pointer;
    border: 1px solid silver;
    background: #f4f4f4;
  }
  .selectedRow {
    color: white;
    background: #606062;
  }
  p {
    margin: 1px;
    border-bottom: 1px solid silver;
  }
  p:last-child {
    border-bottom: none;
  }  
</style>

<div class="wrapper">
  <input type="text" id='textfield'>
  <div id='drawer'>
  </div>
</div>
`;

class TextboxWithDropdown extends HTMLElement {  

  constructor() {
    // Always call super first in constructor
    super();
    // and attach the component
    this._shadowRoot = this.attachShadow({ 'mode': 'open' });
  }

  connectedCallback() {
    // and when the component is mounted, do the rest to make it work
    this.dictionary = [];
    this.selectedIndex = 0;
    this.filteredWordsCount = 0;
    this.isDrawerOpen = false;

    this._shadowRoot.innerHTML = template;
    this.textfield = this._shadowRoot.getElementById("textfield");
    this.dictionary = this.getAttribute("dictionary").split(',');
    this.textfield.value = this.getAttribute("value");
    this.textfield.addEventListener("keyup", function(e) {
      this.keyUp(e);
    }.bind(this));    
  }

  static get observedAttributes() {
    // on attributes changed by the browser dev tools this will reflect the changes
    return ["dictionary", "value"];
  }  

  get value() {
   // return the value
    return this.textfield.value;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    //Custom square element attributes changed.
    this.dictionary = newValue.split(',');
  }

  selectHighlight(i) {
    this._shadowRoot.getElementById('row-' + this.selectedIndex).classList.remove("selectedRow");
    this._shadowRoot.getElementById('row-' + i).classList.add("selectedRow");
    this.selectedIndex = i;
  }

  keyUp(e) {
  if(e.keyCode == 13) {
    this.rowSelected(e);
    return;
  }
  if(e.keyCode == '38' || e.keyCode == '40') {
    this.arrowUpDown(e);
    return;
  }
  var prefix = this._shadowRoot.getElementById('textfield').value;
  if(prefix == '') {
    this._shadowRoot.getElementById('drawer').innerHTML = '';
    this.selectedIndex = 0;
    this.filteredWordsCount = 0;
    return;
  }
  if(this.isDrawerOpen == true)
    return;
  var words = this.filterWords(prefix);
  this._shadowRoot.getElementById('drawer').innerHTML = words.join('');
  // attach the events
  var c = 0;
  words.map(function(row, i) {
    var row = this._shadowRoot.getElementById('row-' + i);
    row.addEventListener("mousemove", function() {
      this.selectHighlight(i);
    }.bind(this));
    row.addEventListener("click", function(e) {
      this.rowSelected(e);
    }.bind(this));
  }.bind(this));
  // select first row if any
  if(words.length > 0)
    this._shadowRoot.getElementById('row-0').classList.add("selectedRow");
}  

arrowUpDown(e) {
  if(this.selectedIndex > -1)
    this._shadowRoot.getElementById('row-' + this.selectedIndex).classList.remove("selectedRow");    
  if(e.keyCode == '38' && this.selectedIndex > 0) {
    // arrow up
    this.selectedIndex --;
  }
  else if(e.keyCode == '40' && this.selectedIndex < this.filteredWordsCount - 1) {
    // arrow down
    this.selectedIndex ++;
  }
  this._shadowRoot.getElementById('row-' + this.selectedIndex).classList.add("selectedRow");
  e.preventDefault();
  return false;
}

rowSelected(e) {
  if(this.filteredWordsCount == 0)
    return;
  this._shadowRoot.getElementById('textfield').value = this._shadowRoot.getElementById('row-' + this.selectedIndex).innerText;
  this._shadowRoot.getElementById('drawer').innerHTML = '';
  this.filteredWordsCount = 0;
  this.selectedIndex = 0;
  e.preventDefault();
  return false;    
}

//business logic comes here. Bad idea!. Separate this in a diffrent class. But for the simplicity of the example we will keep it here.
filterWords(prefix) {
  prefix = prefix.toLowerCase();
  var result = [];
  for(var i=0; i < this.dictionary.length;i ++) {
    var wordArray = this.dictionary[i].toLowerCase();
    for(var j=0; j < prefix.length && j < wordArray.length; j ++) {
      if(prefix[j] != wordArray[j]) {
        break;
      }
    }
    if(prefix.length == j) {
      var wordRow = '<p id="row-' + result.length + '">' + this.dictionary[i] + '</p>';
      result.push(wordRow);
    }
  }
  this.filteredWordsCount = result.length;
  return result;
}  

}



window.customElements.define('textbox-with-dropdown', TextboxWithDropdown);