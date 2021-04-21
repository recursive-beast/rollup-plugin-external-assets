import png2 from "../assets/image2.png";
import text from "./file1";
import sayHi from "./file2";

import("../assets/image.png")
	.then(png => console.log(png))
	.catch(err => console.error(err));

console.log(text);
console.log(png2);
sayHi();
