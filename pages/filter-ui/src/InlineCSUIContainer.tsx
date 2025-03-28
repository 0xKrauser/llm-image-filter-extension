import type { CSUIContainerProps } from '@extension/anchors';

export const InlineCSUIContainer = (props: CSUIContainerProps) => (
  <div
    id="anchors-inline"
    className="anchors-csui-container"
    style={{
      display: 'flex',
      position: 'relative',
      top: 0,
      left: 0,
    }}>
    {props.children}
  </div>
);
