import Head from 'next/head';
import { Rectangle, Texture, BaseTexture } from 'pixi.js';
import { Stage, Sprite} from '@pixi/react';

export default function pixi() {
  const bounds = new Rectangle(0, 0, 0, 1);
  // const tileset = BaseTexture.fromImage(TextureAtlas.$.imagePath);
  let tile;
  try {
    tile = Texture.from('img/pixi/Tileset.png');
    tile.frame = bounds
  } catch (err) {
    console.log(err);
  }
  return (
    <>
      <Head>
        <title>Wars World Pixi Demo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stage>
        <Sprite
          // image="https://pixijs.io/pixi-react/img/bunny.png"
          // image="img/pixi/Tileset.png"
          texture={tile}
          width={100}
          height={100}
          // x={3}
          // y={14}
        />
      </Stage>
    </>
  );
}
