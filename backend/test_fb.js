import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);

async function test() {
  const { stdout } = await execPromise('"./yt-dlp.exe" -j "https://www.facebook.com/share/v/18f9dZeWCT/"');
  const info = JSON.parse(stdout);
  console.log("FORMATS:");
  info.formats.forEach(f => {
    console.log(`${f.format_id}: ext=${f.ext}, vcodec=${f.vcodec}, acodec=${f.acodec}, res=${f.resolution}`);
  });
}
test();
