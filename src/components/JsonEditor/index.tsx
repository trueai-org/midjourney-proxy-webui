import React, { useEffect } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-textmate';

interface JsonEditorFormItemProps {
  value?: object;
  onChange?: (value: object) => void;
}

const JsonEditor: React.FC<JsonEditorFormItemProps> = ({ value = {}, onChange }) => {
  const [textValue, setTextValue] = React.useState(JSON.stringify(value, null, 2));
  const [isValidJson, setIsValidJson] = React.useState(true);

  useEffect(() => {
    // 只有不等时才更新
    const json1 = JSON.stringify(value);
    const json2 = JSON.stringify(JSON.parse(textValue));
    if (json1 !== json2) {
      setTextValue(JSON.stringify(value, null, 2));
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    setTextValue(newValue);
    try {
      const parsedValue = JSON.parse(newValue);
      setIsValidJson(true);
      if (onChange) {
        onChange(parsedValue);
      }
    } catch (error) {
      setIsValidJson(false);
    }
  };
  return (
    <div style={{width:'100%'}}>
      <AceEditor
        mode="json"
        theme="textmate"
        value={textValue}
        onChange={handleChange}
        name="json-editor"
        editorProps={{ $blockScrolling: true }} //  // 阻止滚动事件的某些操作
        height="auto"
        maxLines={Infinity}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
          useWorker: false,
        }}
        style={{ width:'100%', minHeight: '80px' }}
        fontSize={14}
        lineHeight={19}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
      />
      {!isValidJson && (
        <div style={{ color: 'red', marginTop: '8px' }}>JSON 格式错误，请检查输入！</div>
      )}
    </div>
  );
};

export default JsonEditor;

// import React from 'react';
// import ReactJson, { InteractionProps } from 'react-json-view';

// interface JsonEditorFormItemProps {
//   value?: object;
//   onChange?: (value: object) => void;
// }

// const JsonEditor: React.FC<JsonEditorFormItemProps> = ({ value = {}, onChange }) => {
//   const handleEdit = (edit: InteractionProps) => {
//     if (onChange) {
//       onChange(edit.updated_src);
//     }
//   };

//   const handleAdd = (add: InteractionProps) => {
//     if (onChange) {
//       onChange(add.updated_src);
//     }
//   };

//   const handleDelete = (del: InteractionProps) => {
//     if (onChange) {
//       onChange(del.updated_src);
//     }
//   };

//   return (
//     <ReactJson
//       src={value}
//       onEdit={handleEdit}
//       onAdd={handleAdd}
//       onDelete={handleDelete}
//       style={{ minHeight: '120px', borderRadius: '6px', border: '1px solid #d9d9d9;' }}
//       collapsed={false} // 设置为 false 以默认展开 JSON 结构
//       enableClipboard={true} // 启用剪贴板功能
//       displayDataTypes={false} // 禁用数据类型标签以简化 UI
//       displayObjectSize={false} // 禁用对象大小标签
//       indentWidth={2} // 设置缩进宽度以提高可读性
//       iconStyle="triangle" // 使用三角形图标进行展开/折叠操作
//     />
//   );
// };

// export default JsonEditor;
