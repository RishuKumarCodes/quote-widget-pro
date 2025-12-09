import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

const InfoBtn = ({ size = 24, iconColor = '#000', bg = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 46 46" fill="none">
    {/* Background circle */}
    <Circle cx="23" cy="23" r="23" fill={bg} />

    {/* Smaller centered "i" */}
    <G transform="translate(23,23) scale(0.8) translate(-23,-23)">
      <Path
        d="M25.999,33c0,1.657-1.343,3-3,3s-3-1.343-3-3V21
           c0-1.657,1.343-3,3-3s3,1.343,3,3V33z
           M22.946,15.872c-1.728,0-2.88-1.224-2.844-2.735
           c-0.036-1.584,1.116-2.771,2.879-2.771
           c1.764,0,2.88,1.188,2.917,2.771
           C25.897,14.648,24.746,15.872,22.946,15.872z"
        fill={iconColor}
      />
    </G>
  </Svg>
);

export default InfoBtn;
