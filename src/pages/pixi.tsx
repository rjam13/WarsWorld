import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { MapTile } from 'server/map-parser';
import { trpc } from 'utils/trpc';
import {
  Application,
  Sprite,
  SCALE_MODES,
  Assets,
  Texture,
  settings,
  BaseTexture,
} from 'pixijs';
import styles from '../styles/match.module.css';

const spriteURLMap: Record<string, string> = {
  pi: 'pipes',
  ri: 'river',
  br: 'roads',
  ro: 'roads',
  se: 'sea',
  sh: 'shoal',
  si: 'silo',
};

const numberMapping: Record<string, string> = {
  0: 'hq',
  1: 'city',
  2: 'base',
  3: 'airport',
  4: 'port',
  5: 'comtower',
};

const getSpriteURL = (terrainImage: string) => {
  const tileCode = terrainImage.slice(0, 2);

  if (['os', 'bm', 'ne'].includes(tileCode)) {
    return `countries/${numberMapping[terrainImage.slice(2)]}/${terrainImage}`;
  }

  const spriteFolder = spriteURLMap[tileCode];

  if (spriteFolder === undefined) {
    return terrainImage;
  }

  return `${spriteFolder}/${terrainImage}`;
};

// This might be a map square
export type Segment = {
  tile: MapTile;
  squareHighlight: JSX.Element | null;
  menu: JSX.Element | null;
};

export default function Pixi() {
  const [segments, setSegments] = useState<Segment[] | null | undefined>(null);
  const pixiCanvasRef = useRef<HTMLCanvasElement>(null);

  // the hash found in the url, this page does not have it
  // note: this is pulled from match/[matchId].tsx
  const { query } = useRouter();
  // const matchId = query.matchId as string;
  const matchId = 'clgvbeh6n0001m0w1ntt8pl0k';
  trpc.match.full.useQuery(matchId, {
    onSuccess(data) {
      if (data === null) {
        throw new Error(`Match ${matchId} not found!`);
      }

      if (!segments) {
        setSegments(
          data.matchState.mapTiles.map((tile) => ({
            tile,
            menu: null,
            squareHighlight: null,
          })),
        );
      }
    },
  });

  useEffect(() => {
    if (pixiCanvasRef.current === null || segments == null) {
      return;
    }

    BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

    const pixiApp = new Application({
      view: pixiCanvasRef.current,
      resolution: 2,
    });

    pixiApp.stage.position.set(200, 0);

    (async () => {
      for (const indexString in segments) {
        const seg = segments[indexString];
        const index = Number.parseInt(indexString, 10);

        const texture = await Assets.load<Texture>(
          `/img/mapTiles/${getSpriteURL(seg.tile.terrainImage)}.webp`,
        );

        const forestSprite = Sprite.from(texture);

        // x and y coordinates are calculated using the index
        // there will soon x and y attributes in type segment
        forestSprite.x = (index % 18) * 16;
        forestSprite.y =
          Math.floor(index / 18) * 16 - (forestSprite.height - 16);
        pixiApp.stage.addChild(forestSprite);
      }
    })();

    return () => {
      pixiApp.stop();
    };
  }, [pixiCanvasRef, segments]);

  return (
    <div className={styles.match + ' gameBox'}>
      <canvas
        style={{
          imageRendering: 'pixelated',
        }}
        ref={pixiCanvasRef}
        width={800}
        height={600}
      ></canvas>
    </div>
  );
  // const bounds = new Rectangle(0, 0, 0, 1);
  // // const tileset = BaseTexture.fromImage(TextureAtlas.$.imagePath);
  // let tile;
  // try {
  //   tile = Texture.from('img/pixi/Tileset.png');
  //   tile.frame = bounds
  // } catch (err) {
  //   console.log(err);
  // }
  // return (
  //   <>
  //     <Head>
  //       <title>Wars World Pixi Demo</title>
  //       <link rel="icon" href="/favicon.ico" />
  //     </Head>
  //     <Stage>
  //       <Sprite
  //         // image="https://pixijs.io/pixi-react/img/bunny.png"
  //         // image="img/pixi/Tileset.png"
  //         texture={tile}
  //         width={100}
  //         height={100}
  //         // x={3}
  //         // y={14}
  //       />
  //     </Stage>
  //   </>
  // );
}
