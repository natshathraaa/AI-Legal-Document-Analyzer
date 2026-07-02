(async ()=>{
  try{
    const pkg = require('pdf-parse');
    console.log('typeof require pdf-parse:', typeof pkg);
    console.log('keys:', Object.keys(pkg));
      if (pkg && pkg.default) console.log('has default');
      if (pkg && pkg.PDFParse) {
        console.log('PDFParse typeof:', typeof pkg.PDFParse);
        console.log('PDFParse proto keys:', Object.getOwnPropertyNames(pkg.PDFParse.prototype));
        console.log('PDFParse toString:', String(pkg.PDFParse));
      }
  }catch(e){ console.error(e); }
})();
