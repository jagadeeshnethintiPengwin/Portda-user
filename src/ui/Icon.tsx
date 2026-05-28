import React from 'react';
import Svg, {
  Path,
  Circle,
  Line,
  Rect,
  Polyline,
  Polygon,
  G,
} from 'react-native-svg';

export type IconName =
  /* Navigation */
  | 'arrow-left' | 'arrow-right' | 'menu'
  | 'chevron-down' | 'chevron-up' | 'chevron-right' | 'chevron-left'
  /* Actions */
  | 'search' | 'plus' | 'plus-thick' | 'close' | 'close-thick'
  | 'check' | 'check-circle' | 'edit' | 'trash-2' | 'log-out'
  | 'tray' | 'send' | 'send-fill' | 'sliders' | 'filter'
  | 'more-vertical' | 'copy' | 'download'
  /* Status */
  | 'bell' | 'info' | 'help-circle' | 'alert-triangle' | 'clock'
  | 'check-badge' | 'trending-up'
  /* Communication */
  | 'chat' | 'message-circle' | 'phone'
  /* Security */
  | 'lock' | 'key' | 'shield' | 'eye' | 'eye-off'
  /* Files */
  | 'file' | 'file-text' | 'clipboard' | 'image' | 'mic'
  /* People */
  | 'user' | 'users' | 'building'
  /* Commerce */
  | 'card' | 'wallet' | 'dollar' | 'bar-chart'
  /* Navigation / Maps */
  | 'location' | 'map-pin' | 'compass'
  /* Objects */
  | 'settings' | 'grid' | 'layers' | 'home' | 'list'
  | 'star' | 'star-fill' | 'heart'
  /* Maritime */
  | 'anchor' | 'ship' | 'fuel' | 'life-buoy' | 'package'
  | 'tool' | 'briefcase'
  /* Misc */
  | 'toggle-right' | 'refresh'
  | 'mail';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  color = '#0A1929',
  strokeWidth = 2,
  fill = 'none',
}) => {
  const s = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill,
  };
  const wrap = (children: React.ReactNode) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {children}
    </Svg>
  );

  switch (name) {
    /* ── Navigation ── */
    case 'arrow-left':
      return wrap(<Path d="M19 12H5M12 19l-7-7 7-7" {...s} />);
    case 'arrow-right':
      return wrap(<Path d="M5 12h14M12 5l7 7-7 7" {...s} />);
    case 'menu':
      return wrap(
        <>
          <Line x1={3} y1={6} x2={21} y2={6} {...s} />
          <Line x1={3} y1={12} x2={21} y2={12} {...s} />
          <Line x1={3} y1={18} x2={21} y2={18} {...s} />
        </>,
      );
    case 'chevron-down':
      return wrap(<Polyline points="7 10 12 15 17 10" {...s} />);
    case 'chevron-up':
      return wrap(<Polyline points="5 12 12 5 19 12" {...s} />);
    case 'chevron-right':
      return wrap(<Polyline points="9 6 15 12 9 18" {...s} />);
    case 'chevron-left':
      return wrap(<Polyline points="15 6 9 12 15 18" {...s} />);

    /* ── Actions ── */
    case 'search':
      return wrap(
        <>
          <Circle cx={11} cy={11} r={7} {...s} />
          <Path d="m20 20-3.5-3.5" {...s} />
        </>,
      );
    case 'plus':
      return wrap(<Path d="M12 5v14M5 12h14" {...s} />);
    case 'plus-thick':
      return wrap(<Path d="M12 5v14M5 12h14" {...s} strokeWidth={2.5} />);
    case 'close':
      return wrap(<Path d="M18 6 6 18M6 6l12 12" {...s} />);
    case 'close-thick':
      return wrap(<Path d="M18 6 6 18M6 6l12 12" {...s} strokeWidth={2.5} />);
    case 'check':
      return wrap(<Path d="M9 12l2 2 4-4" {...s} />);
    case 'check-circle':
      return wrap(
        <>
          <Circle cx={12} cy={12} r={10} {...s} />
          <Path d="M9 12l2 2 4-4" {...s} />
        </>,
      );
    case 'check-badge':
      return wrap(
        <>
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" {...s} />
          <Path d="M9 12l2 2 4-4" {...s} />
        </>,
      );
    case 'edit':
      return wrap(
        <>
          <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" {...s} />
          <Path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" {...s} />
        </>,
      );
    case 'trash-2':
      return wrap(
        <>
          <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" {...s} />
          <Line x1={10} y1={11} x2={10} y2={17} {...s} />
          <Line x1={14} y1={11} x2={14} y2={17} {...s} />
        </>,
      );
    case 'log-out':
      return wrap(
        <>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...s} />
          <Polyline points="16 17 21 12 16 7" {...s} />
          <Line x1={21} y1={12} x2={9} y2={12} {...s} />
        </>,
      );
    case 'tray':
      return wrap(
        <>
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" {...s} />
          <Polyline points="7 10 12 15 17 10" {...s} />
          <Line x1={12} y1={15} x2={12} y2={3} {...s} />
        </>,
      );
    case 'send':
      return wrap(
        <>
          <Line x1={22} y1={2} x2={11} y2={13} {...s} />
          <Polygon points="22 2 15 22 11 13 2 9 22 2" {...s} />
        </>,
      );
    case 'send-fill':
      return wrap(
        <Polygon points="22 2 15 22 11 13 2 9 22 2" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />,
      );
    case 'sliders':
      return wrap(
        <>
          <Line x1={4} y1={6} x2={20} y2={6} {...s} />
          <Line x1={4} y1={12} x2={14} y2={12} {...s} />
          <Line x1={4} y1={18} x2={9} y2={18} {...s} />
          <Circle cx={18} cy={12} r={1.7} {...s} />
          <Circle cx={13} cy={18} r={1.7} {...s} />
        </>,
      );
    case 'filter':
      return wrap(<Polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" {...s} />);
    case 'more-vertical':
      return wrap(
        <>
          <Circle cx={12} cy={5} r={1.7} fill={color} stroke={color} />
          <Circle cx={12} cy={12} r={1.7} fill={color} stroke={color} />
          <Circle cx={12} cy={19} r={1.7} fill={color} stroke={color} />
        </>,
      );
    case 'copy':
      return wrap(
        <>
          <Rect x={9} y={9} width={13} height={13} rx={2} {...s} />
          <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" {...s} />
        </>,
      );
    case 'download':
      return wrap(
        <>
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" {...s} />
          <Polyline points="7 10 12 15 17 10" {...s} />
          <Line x1={12} y1={15} x2={12} y2={3} {...s} />
        </>,
      );

    /* ── Status ── */
    case 'bell':
      return wrap(
        <>
          <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" {...s} />
          <Path d="M13.7 21a2 2 0 0 1-3.4 0" {...s} />
        </>,
      );
    case 'info':
      return wrap(
        <>
          <Circle cx={12} cy={12} r={10} {...s} />
          <Path d="M12 16v-4M12 8h.01" {...s} />
        </>,
      );
    case 'help-circle':
      return wrap(
        <>
          <Circle cx={12} cy={12} r={10} {...s} />
          <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" {...s} />
          <Line x1={12} y1={17} x2={12.01} y2={17} {...s} />
        </>,
      );
    case 'alert-triangle':
      return wrap(
        <>
          <Path d="m10.29 3.86-8.27 14.31A1 1 0 0 0 2.9 20h18.2a1 1 0 0 0 .88-1.48L13.71 4.14a2 2 0 0 0-3.42-.28z" {...s} />
          <Line x1={12} y1={9} x2={12} y2={13} {...s} />
          <Line x1={12} y1={17} x2={12.01} y2={17} {...s} />
        </>,
      );
    case 'clock':
      return wrap(
        <>
          <Circle cx={12} cy={12} r={10} {...s} />
          <Polyline points="12 6 12 12 16 14" {...s} />
        </>,
      );
    case 'trending-up':
      return wrap(
        <>
          <Polyline points="22 7 13.5 15.5 8.5 10.5 2 17" {...s} />
          <Polyline points="16 7 22 7 22 13" {...s} />
        </>,
      );

    /* ── Communication ── */
    case 'chat':
      return wrap(
        <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...s} />,
      );
    case 'message-circle':
      return wrap(
        <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" {...s} />,
      );
    case 'phone':
      return wrap(
        <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 2 .7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.81.33 1.81.57 2.81.7A2 2 0 0 1 22 16.92z" {...s} />,
      );

    /* ── Security ── */
    case 'lock':
      return wrap(
        <>
          <Rect x={3} y={11} width={18} height={11} rx={2} {...s} />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" {...s} />
        </>,
      );
    case 'key':
      return wrap(
        <>
          <Path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" {...s} />
        </>,
      );
    case 'shield':
      return wrap(
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...s} />,
      );
    case 'eye':
      return wrap(
        <>
          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...s} />
          <Circle cx={12} cy={12} r={3} {...s} />
        </>,
      );
    case 'eye-off':
      return wrap(
        <>
          <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" {...s} />
          <Line x1={1} y1={1} x2={23} y2={23} {...s} />
        </>,
      );

    /* ── Files ── */
    case 'file':
      return wrap(
        <>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...s} />
          <Polyline points="14 2 14 8 20 8" {...s} />
        </>,
      );
    case 'file-text':
      return wrap(
        <>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...s} />
          <Polyline points="14 2 14 8 20 8" {...s} />
          <Line x1={16} y1={13} x2={8} y2={13} {...s} />
          <Line x1={16} y1={17} x2={8} y2={17} {...s} />
          <Polyline points="10 9 9 9 8 9" {...s} />
        </>,
      );
    case 'clipboard':
      return wrap(
        <>
          <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" {...s} />
          <Rect x={8} y={2} width={8} height={4} rx={1} {...s} />
        </>,
      );
    case 'image':
      return wrap(
        <>
          <Rect x={3} y={3} width={18} height={18} rx={2} {...s} />
          <Circle cx={8.5} cy={8.5} r={1.5} {...s} />
          <Path d="M21 15l-5-5L5 21" {...s} />
        </>,
      );
    case 'mic':
      return wrap(
        <>
          <Rect x={9} y={2} width={6} height={12} rx={3} {...s} />
          <Path d="M5 10a7 7 0 0 0 14 0M12 17v4" {...s} />
        </>,
      );

    /* ── People ── */
    case 'user':
      return wrap(
        <>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...s} />
          <Circle cx={12} cy={7} r={4} {...s} />
        </>,
      );
    case 'users':
      return wrap(
        <>
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...s} />
          <Circle cx={9} cy={7} r={4} {...s} />
          <Path d="M23 21v-2a4 4 0 0 0-3-3.87" {...s} />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" {...s} />
        </>,
      );
    case 'building':
      return wrap(
        <>
          <Rect x={1} y={3} width={15} height={18} rx={1} {...s} />
          <Path d="M16 8h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-4" {...s} />
          <Line x1={5} y1={7} x2={5} y2={7} {...s} strokeWidth={2.5} />
          <Line x1={9} y1={7} x2={9} y2={7} {...s} strokeWidth={2.5} />
          <Line x1={5} y1={11} x2={5} y2={11} {...s} strokeWidth={2.5} />
          <Line x1={9} y1={11} x2={9} y2={11} {...s} strokeWidth={2.5} />
          <Line x1={5} y1={15} x2={9} y2={15} {...s} />
        </>,
      );

    /* ── Commerce ── */
    case 'card':
      return wrap(
        <>
          <Rect x={2} y={5} width={20} height={14} rx={2} {...s} />
          <Line x1={2} y1={10} x2={22} y2={10} {...s} />
        </>,
      );
    case 'wallet':
      return wrap(
        <>
          <Path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...s} />
          <Path d="M16 12h.01" {...s} />
        </>,
      );
    case 'dollar':
      return wrap(
        <>
          <Line x1={12} y1={1} x2={12} y2={23} {...s} />
          <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" {...s} />
        </>,
      );
    case 'bar-chart':
      return wrap(
        <>
          <Line x1={12} y1={20} x2={12} y2={10} {...s} />
          <Line x1={18} y1={20} x2={18} y2={4} {...s} />
          <Line x1={6} y1={20} x2={6} y2={16} {...s} />
        </>,
      );

    /* ── Navigation / Maps ── */
    case 'location':
    case 'map-pin':
      return wrap(
        <>
          <Path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8z" {...s} />
          <Circle cx={12} cy={10} r={3} {...s} />
        </>,
      );
    case 'compass':
      return wrap(
        <>
          <Circle cx={12} cy={12} r={10} {...s} />
          <Polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" {...s} />
        </>,
      );

    /* ── Objects ── */
    case 'settings':
      return wrap(
        <>
          <Circle cx={12} cy={12} r={3} {...s} />
          <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" {...s} />
        </>,
      );
    case 'grid':
      return wrap(
        <>
          <Rect x={3} y={3} width={7} height={7} rx={1.5} {...s} />
          <Rect x={14} y={3} width={7} height={7} rx={1.5} {...s} />
          <Rect x={3} y={14} width={7} height={7} rx={1.5} {...s} />
          <Rect x={14} y={14} width={7} height={7} rx={1.5} {...s} />
        </>,
      );
    case 'layers':
      return wrap(
        <>
          <Polygon points="12 2 2 7 12 12 22 7 12 2" {...s} />
          <Polyline points="2 17 12 22 22 17" {...s} />
          <Polyline points="2 12 12 17 22 12" {...s} />
        </>,
      );
    case 'home':
      return wrap(
        <>
          <Path d="M3 11.5 12 4l9 7.5" {...s} />
          <Path d="M5 10v10h14V10" {...s} />
        </>,
      );
    case 'list':
      return wrap(
        <>
          <Line x1={8} y1={6} x2={21} y2={6} {...s} />
          <Line x1={8} y1={12} x2={21} y2={12} {...s} />
          <Line x1={8} y1={18} x2={21} y2={18} {...s} />
          <Line x1={3} y1={6} x2={3.01} y2={6} {...s} />
          <Line x1={3} y1={12} x2={3.01} y2={12} {...s} />
          <Line x1={3} y1={18} x2={3.01} y2={18} {...s} />
        </>,
      );
    case 'star':
      return wrap(
        <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" {...s} />,
      );
    case 'star-fill':
      return wrap(
        <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />,
      );
    case 'heart':
      return wrap(
        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" {...s} />,
      );

    /* ── Maritime ── */
    case 'anchor':
      return wrap(
        <>
          <Circle cx={12} cy={5} r={3} {...s} />
          <Line x1={12} y1={8} x2={12} y2={22} {...s} />
          <Path d="M5 15H3a9 9 0 0 0 18 0h-2" {...s} />
          <Path d="M3 9h18" {...s} />
        </>,
      );
    case 'ship':
      return wrap(
        <>
          <Path d="m3 17 2 4h14l2-4" {...s} />
          <Path d="M5 17 4 7l8-5 8 5-1 10" {...s} />
          <Line x1={12} y1={2} x2={12} y2={9} {...s} />
          <Path d="M5 17H3a2 2 0 0 1 0-4" {...s} />
          <Path d="M19 17h2a2 2 0 0 0 0-4" {...s} />
        </>,
      );
    case 'fuel':
      return wrap(
        <>
          <Path d="M3 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18H3z" {...s} />
          <Line x1={3} y1={22} x2={13} y2={22} {...s} />
          <Path d="M13 7h2a2 2 0 0 1 2 2v7a2 2 0 0 0 4 0v-8.69" {...s} />
          <Line x1={19} y1={7} x2={21} y2={5} {...s} />
          <Circle cx={21} cy={4} r={1} fill={color} stroke={color} />
          <Line x1={5} y1={6} x2={11} y2={6} {...s} />
        </>,
      );
    case 'life-buoy':
      return wrap(
        <>
          <Circle cx={12} cy={12} r={10} {...s} />
          <Circle cx={12} cy={12} r={4} {...s} />
          <Line x1={4.93} y1={4.93} x2={7.76} y2={7.76} {...s} />
          <Line x1={16.24} y1={16.24} x2={19.07} y2={19.07} {...s} />
          <Line x1={19.07} y1={4.93} x2={16.24} y2={7.76} {...s} />
          <Line x1={7.76} y1={16.24} x2={4.93} y2={19.07} {...s} />
        </>,
      );
    case 'package':
      return wrap(
        <>
          <Line x1={16.5} y1={9.4} x2={7.55} y2={4.24} {...s} />
          <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" {...s} />
          <Polyline points="3.27 6.96 12 12.01 20.73 6.96" {...s} />
          <Line x1={12} y1={22.08} x2={12} y2={12} {...s} />
        </>,
      );
    case 'tool':
      return wrap(
        <>
          <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" {...s} />
        </>,
      );
    case 'briefcase':
      return wrap(
        <>
          <Rect x={2} y={7} width={20} height={14} rx={2} {...s} />
          <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" {...s} />
        </>,
      );

    /* ── Misc ── */
    case 'toggle-right':
      return wrap(
        <>
          <Rect x={1} y={5} width={22} height={14} rx={7} {...s} />
          <Circle cx={16} cy={12} r={3} fill={color} stroke={color} />
        </>,
      );
    case 'refresh':
      return wrap(
        <>
          <Polyline points="1 4 1 10 7 10" {...s} />
          <Polyline points="23 20 23 14 17 14" {...s} />
          <Path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" {...s} />
        </>,
      );
    case 'mail':
      return wrap(
        <>
          <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" {...s} />
          <Polyline points="22 6 12 13 2 6" {...s} />
        </>,
      );

    default:
      return wrap(<Circle cx={12} cy={12} r={9} {...s} />);
  }
};
