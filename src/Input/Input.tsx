import React, { ChangeEvent } from 'react';
import './Input.css';

interface InputProps {
  value?: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

interface InputState {
  value: string;
};

export default class Input extends React.Component<InputProps, InputState> {
  private inputRef: React.RefObject<HTMLInputElement | null>;

  constructor(props: InputProps) {
    super(props);

    this.state = {
      value: props.value || '',
    };
    this.inputRef = React.createRef<HTMLInputElement>();
  }

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    this.setState({ value });
    this.props.onChange(value);
  }

  handleClear = () => {
    this.setState({ value: '' });
    this.props.onChange('');
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  componentDidUpdate(prevProps: InputProps) {
    // Синхронизация значения из пропсов, если оно изменилось извне
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value || '' });
    }
  }

  render() {
    const { value } = this.state;

    return (
      <div className="Input">
        <span className="Input-Icon" aria-hidden="true">
          /
        </span>
        <input
          ref={this.inputRef}
          className="Input-Field"
          placeholder="Type a code: AA, AK, 77, 178, A, 7"
          value={value}
          onChange={this.handleChange}
          onFocus={this.props.onFocus}
          onBlur={this.props.onBlur}
        />
        {value ? (
          <button className="Input-Clear" onClick={this.handleClear} aria-label="Clear input">
            ✕
          </button>
        ) : (
          <span className="Input-Shortcut" aria-hidden="true">
            Enter
          </span>
        )}
      </div>
    );
  }
}
