
var template = `
<style>
  .wrapper {
    display: inline-grid;
    border: 1px solid silver;
  }
  .drawer {
    position: relative;
  }
  .selectedRow {
    color: white;
    background: blue;
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
    this._shadowRoot = this.attachShadow({ 'mode': 'open' });
  }

  connectedCallback() {
    this.dictionary = [];
    this.selectedIndex = 0;
    this.filteredWordsCount = 0;
    this.isDrawerOpen = false;

    this._shadowRoot.innerHTML = template;
    this.textfield = this._shadowRoot.getElementById("textfield");
    this.dictionary = this.getAttribute("dictionary").split(',');
    this.textfield.value = this.getAttribute("value");
    this.textfield.addEventListener("keyup", function(e) {
      this.keyDown(e);
    }.bind(this));    
  }

  static get observedAttributes(){
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
 

  keyDown(e) {
    if(e.keyCode == 13) {
      this.enterKeyPressed(e);
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
      row.addEventListener("click", function() {
        this._shadowRoot.getElementById('textfield').value = row.innerText;
      }.bind(this));
    }.bind(this));
    // select first row if any
    if(words.length > 0)
      this._shadowRoot.getElementById('row-0').classList.add("selectedRow");
  }  

  filterWords(prefix) {
    var result = [];
    for(var i=0; i < this.dictionary.length;i ++) {
      var wordArray = this.dictionary[i];
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

  arrowUpDown(e) {
    if(this.selectedIndex > -1)
      this._shadowRoot.getElementById('row-' + this.selectedIndex).classList.remove("selectedRow");    
    if(e.keyCode == '38' && this.selectedIndex > 0) {
      this.selectedIndex --;
    }
    else if(e.keyCode == '40' && this.selectedIndex < this.filteredWordsCount - 1) {
      this.selectedIndex ++;
    }
    this._shadowRoot.getElementById('row-' + this.selectedIndex).classList.add("selectedRow");
    e.preventDefault();
    return false;
  }

  enterKeyPressed(e) {
    if(this.filteredWordsCount == 0)
      return;
    this._shadowRoot.getElementById('textfield').value = this._shadowRoot.getElementById('row-' + this.selectedIndex).innerText;
    this._shadowRoot.getElementById('drawer').innerHTML = '';
    this.filteredWordsCount = 0;
    this.selectedIndex = 0;
    e.preventDefault();
    return false;    
  }

}

window.customElements.define('textbox-with-dropdown', TextboxWithDropdown);