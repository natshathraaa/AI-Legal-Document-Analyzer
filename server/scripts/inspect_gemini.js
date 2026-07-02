(async ()=>{
  try{
    // Use the centralized gemini client to avoid creating models elsewhere.
    const gemini = require('../utils/geminiClient')
    console.log('gemini client loaded:', Object.keys(gemini))
  }catch(e){
    console.error('inspect error', e)
  }
})();
