declare module "jsonwebtoken";
declare module "csv-parser";
declare module "@splinetool/react-spline" {
  import * as React from "react";

  type SplineProps = {
    scene: string;
    className?: string;
  };

  const Spline: React.ComponentType<SplineProps>;
  export default Spline;
}
