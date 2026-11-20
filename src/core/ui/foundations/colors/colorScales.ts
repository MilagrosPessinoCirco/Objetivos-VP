// Full color scales extracted from the Figma "DS - Sharepoint - Fluent UI v8" Colorimetria frame (node 10:1174).
export interface IColorScaleStep {
  scale: string;
  value: string;
  textColor: string;
}

export interface IColorScaleGroup {
  name: string;
  steps: IColorScaleStep[];
}

export const colorScales: IColorScaleGroup[] = [
  {
    name: 'Primary',
    steps: [
      { scale: '900', value: '#011232', textColor: '#fcfcfc' },
      { scale: '800', value: '#02225d', textColor: '#fcfcfc' },
      { scale: '700', value: '#032e7d', textColor: '#fcfcfc' },
      { scale: '600', value: '#03399c', textColor: '#fcfcfc' },
      { scale: '500', value: '#0451dd', textColor: '#fcfcfc' },
      { scale: '400', value: '#1567fa', textColor: '#0d0d0d' },
      { scale: '300', value: '#4486fb', textColor: '#0d0d0d' },
      { scale: '200', value: '#73a4fc', textColor: '#0d0d0d' },
      { scale: '100', value: '#a1c2fd', textColor: '#0d0d0d' },
      { scale: '50', value: '#e7efff', textColor: '#0d0d0d' },
    ],
  },
  {
    name: 'Secondary',
    steps: [
      { scale: '900', value: '#002633', textColor: '#fcfcfc' },
      { scale: '800', value: '#003f55', textColor: '#fcfcfc' },
      { scale: '700', value: '#015f7f', textColor: '#fcfcfc' },
      { scale: '600', value: '#0180aa', textColor: '#fcfcfc' },
      { scale: '500', value: '#03bffe', textColor: '#0d0d0d' },
      { scale: '400', value: '#35cbfe', textColor: '#0d0d0d' },
      { scale: '300', value: '#67d8fe', textColor: '#0d0d0d' },
      { scale: '200', value: '#9ae5fe', textColor: '#0d0d0d' },
      { scale: '100', value: '#cbf2ff', textColor: '#0d0d0d' },
      { scale: '50', value: '#e6f9ff', textColor: '#0d0d0d' },
    ],
  },
  {
    name: 'Tertiary',
    steps: [
      { scale: '900', value: '#1a0033', textColor: '#fcfcfc' },
      { scale: '800', value: '#2d0055', textColor: '#fcfcfc' },
      { scale: '700', value: '#440080', textColor: '#fcfcfc' },
      { scale: '600', value: '#5b00ab', textColor: '#fcfcfc' },
      { scale: '500', value: '#8902ff', textColor: '#fcfcfc' },
      { scale: '400', value: '#a034ff', textColor: '#fcfcfc' },
      { scale: '300', value: '#b866ff', textColor: '#0d0d0d' },
      { scale: '200', value: '#cf99ff', textColor: '#0d0d0d' },
      { scale: '100', value: '#e7cbff', textColor: '#0d0d0d' },
      { scale: '50', value: '#f3e6ff', textColor: '#0d0d0d' },
    ],
  },
  {
    name: 'Neutral',
    steps: [
      { scale: '900', value: '#0d0d0d', textColor: '#fcfcfc' },
      { scale: '800', value: '#1f1f1f', textColor: '#fcfcfc' },
      { scale: '700', value: '#3d3d3d', textColor: '#fcfcfc' },
      { scale: '600', value: '#5c5c5c', textColor: '#fcfcfc' },
      { scale: '500', value: '#999999', textColor: '#0d0d0d' },
      { scale: '400', value: '#afafaf', textColor: '#0d0d0d' },
      { scale: '300', value: '#c5c5c5', textColor: '#0d0d0d' },
      { scale: '200', value: '#dbdbdb', textColor: '#0d0d0d' },
      { scale: '100', value: '#f1f1f1', textColor: '#0d0d0d' },
      { scale: '50', value: '#fcfcfc', textColor: '#0d0d0d' },
    ],
  },
  {
    name: 'Red',
    steps: [
      { scale: '900', value: '#330007', textColor: '#fcfcfc' },
      { scale: '800', value: '#55000b', textColor: '#fcfcfc' },
      { scale: '700', value: '#800011', textColor: '#fcfcfc' },
      { scale: '600', value: '#ab0017', textColor: '#fcfcfc' },
      { scale: '500', value: '#ff0224', textColor: '#fcfcfc' },
      { scale: '400', value: '#ff344f', textColor: '#0d0d0d' },
      { scale: '300', value: '#ff667a', textColor: '#0d0d0d' },
      { scale: '200', value: '#ff99a7', textColor: '#0d0d0d' },
      { scale: '100', value: '#ffcbd2', textColor: '#0d0d0d' },
      { scale: '50', value: '#ffe6e9', textColor: '#0d0d0d' },
    ],
  },
  {
    name: 'Orange',
    steps: [
      { scale: '900', value: '#331a00', textColor: '#fcfcfc' },
      { scale: '800', value: '#552b00', textColor: '#fcfcfc' },
      { scale: '700', value: '#804000', textColor: '#fcfcfc' },
      { scale: '600', value: '#ab5600', textColor: '#fcfcfc' },
      { scale: '500', value: '#ff8002', textColor: '#0d0d0d' },
      { scale: '400', value: '#ff9934', textColor: '#0d0d0d' },
      { scale: '300', value: '#ffb266', textColor: '#0d0d0d' },
      { scale: '200', value: '#ffcc99', textColor: '#0d0d0d' },
      { scale: '100', value: '#ffe5cb', textColor: '#0d0d0d' },
      { scale: '50', value: '#fff3e6', textColor: '#0d0d0d' },
    ],
  },
  {
    name: 'Yellow',
    steps: [
      { scale: '900', value: '#332f00', textColor: '#fcfcfc' },
      { scale: '800', value: '#554e00', textColor: '#fcfcfc' },
      { scale: '700', value: '#807500', textColor: '#fcfcfc' },
      { scale: '600', value: '#ab9d00', textColor: '#fcfcfc' },
      { scale: '500', value: '#ffea02', textColor: '#0d0d0d' },
      { scale: '400', value: '#ffee34', textColor: '#0d0d0d' },
      { scale: '300', value: '#fff266', textColor: '#0d0d0d' },
      { scale: '200', value: '#fff799', textColor: '#0d0d0d' },
      { scale: '100', value: '#fffbcb', textColor: '#0d0d0d' },
      { scale: '50', value: '#fffde6', textColor: '#0d0d0d' },
    ],
  },
  {
    name: 'Green',
    steps: [
      { scale: '900', value: '#003311', textColor: '#fcfcfc' },
      { scale: '800', value: '#00551c', textColor: '#fcfcfc' },
      { scale: '700', value: '#00802b', textColor: '#fcfcfc' },
      { scale: '600', value: '#00ab39', textColor: '#fcfcfc' },
      { scale: '500', value: '#02ff56', textColor: '#0d0d0d' },
      { scale: '400', value: '#34ff78', textColor: '#0d0d0d' },
      { scale: '300', value: '#66ff99', textColor: '#0d0d0d' },
      { scale: '200', value: '#99ffbb', textColor: '#0d0d0d' },
      { scale: '100', value: '#cbffdc', textColor: '#0d0d0d' },
      { scale: '50', value: '#e6ffee', textColor: '#0d0d0d' },
    ],
  },
];
