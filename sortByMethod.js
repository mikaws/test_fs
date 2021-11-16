
// This function create a sortBy method with the Schwartzian Transform, a technique used to improve the efficiency of sorting a list of items
// If we use the simplest sort (a - b) our code will run significantly slower and will use more memory

export default (function(){
    if (typeof Object.defineProperty === 'function'){
      try{Object.defineProperty(Array.prototype,'sortBy',{value:sb}); }catch(e){}
    }
    if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;
  
    function sb(f){
      for (var i=this.length;i;){
        var o = this[--i];
        this[i] = [].concat(f.call(o,o,i),o);
      }
      this.sort(function(a,b){
        for (var i=0,len=a.length;i<len;++i){
          if (a[i]!=b[i]) return a[i]<b[i]?-1:1;
        }
        return 0;
      });
      for (var i=this.length;i;){
        this[--i]=this[i][this[i].length-1];
      }
      return this;
    }
})()

// This code is copyright 2012 by Gavin Kistner, !@phrogz.net
// It is covered under the license viewable at http://phrogz.net/JS/_ReuseLicense.txt