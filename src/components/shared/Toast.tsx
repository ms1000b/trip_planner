import { CSSProperties, memo } from 'react';

export default memo(function Toast(props: { id: string; text: string; style?: CSSProperties }): JSX.Element {
  return (
    <div id={props.id} style={props.style}>
      <span className='toast-text'>{props.text}</span>
    </div>
  );
});
