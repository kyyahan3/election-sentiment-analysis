// Set the alpha for a color
export const rgba = (rgb, alpha) => {
  
  return `${rgb.replace('rgb', 'rgba').replace(')', `, ${alpha})`)}`;
};
  