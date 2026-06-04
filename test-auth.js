const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Track requests
  page.on('response', response => {
    if (response.url().includes('callback') || response.url().includes('google')) {
      console.log(`[NETWORK] ${response.status()} ${response.url()}`);
    }
  });

  console.log('Navigating to https://deeplinkos.com...');
  await page.goto('https://deeplinkos.com', { waitUntil: 'networkidle2' });

  // Get initial cookies
  let cookies = await page.cookies();
  console.log('Initial cookies:', cookies.map(c => `${c.name}=${c.value}`).join('; '));

  console.log('Clicking "Continue with Google" directly (if possible) or opening modal...');
  
  // We need to trigger the auth modal.
  // There is a "Start for free" button.
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Start') || b.innerText.includes('Free') || b.innerText.includes('DeepLinkOS'));
    if (btn) btn.click();
    
    // Fallback: look for the auth modal trigger manually
    const headerBtn = document.querySelector('.header__actions button');
    if (headerBtn) headerBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking Google button...');
  await page.evaluate(() => {
    const googleBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Google'));
    if (googleBtn) googleBtn.click();
  });

  // Wait for redirect to Google
  await new Promise(r => setTimeout(r, 5000));
  console.log('Current URL after Google click:', page.url());
  
  cookies = await page.cookies();
  console.log('Cookies before leaving deeplinkos:', cookies.map(c => `${c.name}=${c.value}`).join('; '));

  await browser.close();
})();
