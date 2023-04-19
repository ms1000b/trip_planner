import { memo } from 'react';

export default memo(function Loading(props: { id: string; style?: React.CSSProperties }): JSX.Element {
  return (
    <div id={props.id} style={props.style}>
      <span>Loading...</span>
    </div>
  );
});
