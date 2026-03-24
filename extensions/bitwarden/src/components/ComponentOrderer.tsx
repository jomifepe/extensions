import { Children, isValidElement, ReactNode } from "react";

export type ComponentOrdererProps = {
  /** Key of the child that should appear first. Others stay in their original order. */
  first?: string;
  children?: ReactNode;
};

const ComponentOrderer = ({ first, children }: ComponentOrdererProps) => {
  const childArray = Children.toArray(children);
  if (!first) return <>{childArray}</>;

  const firstIndex = childArray.findIndex((child) => isValidElement(child) && child.key === `.$${first}`);

  if (firstIndex <= 0) return <>{childArray}</>;

  return (
    <>
      {childArray[firstIndex]}
      {childArray.slice(0, firstIndex)}
      {childArray.slice(firstIndex + 1)}
    </>
  );
};

export default ComponentOrderer;
