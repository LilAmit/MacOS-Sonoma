// TextEdit App - Rich text editor
const TextEditApp = () => {
    const [format, setFormat] = React.useState({ bold: false, italic: false, underline: false });
    const editorRef = React.useRef(null);

    const execCmd = (cmd) => {
        document.execCommand(cmd);
        editorRef.current?.focus();
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50/95 border-b border-black/5">
                <button onClick={() => execCmd('bold')} className={`px-2.5 py-1 rounded text-[12px] font-bold hover:bg-black/5 ${format.bold ? 'bg-black/10' : ''}`}>B</button>
                <button onClick={() => execCmd('italic')} className="px-2.5 py-1 rounded text-[12px] italic hover:bg-black/5">I</button>
                <button onClick={() => execCmd('underline')} className="px-2.5 py-1 rounded text-[12px] underline hover:bg-black/5">U</button>
                <button onClick={() => execCmd('strikethrough')} className="px-2.5 py-1 rounded text-[12px] line-through hover:bg-black/5">S</button>
                <div className="w-px h-5 bg-black/10 mx-1"/>
                <button onClick={() => execCmd('justifyLeft')} className="px-2 py-1 rounded hover:bg-black/5 text-[11px]">≡</button>
                <button onClick={() => execCmd('justifyCenter')} className="px-2 py-1 rounded hover:bg-black/5 text-[11px]">≡</button>
                <button onClick={() => execCmd('justifyRight')} className="px-2 py-1 rounded hover:bg-black/5 text-[11px]">≡</button>
                <div className="w-px h-5 bg-black/10 mx-1"/>
                <button onClick={() => execCmd('insertUnorderedList')} className="px-2 py-1 rounded hover:bg-black/5 text-[12px]">• List</button>
                <button onClick={() => execCmd('insertOrderedList')} className="px-2 py-1 rounded hover:bg-black/5 text-[12px]">1. List</button>
                <div className="flex-1"/>
                <select className="text-[12px] border border-black/10 rounded px-1.5 py-0.5 bg-white outline-none cursor-default" onChange={e => { document.execCommand('fontSize', false, e.target.value); }}>
                    {[1,2,3,4,5,6,7].map(s => <option key={s} value={s}>{s === 3 ? '14px' : s === 4 ? '18px' : s === 5 ? '24px' : s === 6 ? '32px' : s === 7 ? '48px' : s === 2 ? '12px' : '10px'}</option>)}
                </select>
            </div>
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="flex-1 p-6 outline-none text-[14px] leading-relaxed overflow-y-auto font-sf"
                style={{ minHeight: '200px' }}
            >
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Welcome to TextEdit</h2>
                <p style={{ marginBottom: '8px' }}>This is a rich text editor. You can format text using the toolbar above.</p>
                <p style={{ marginBottom: '8px' }}>Try making text <b>bold</b>, <i>italic</i>, or <u>underlined</u>.</p>
                <p style={{ marginBottom: '8px' }}>You can also create lists and change text alignment.</p>
                <p>Start editing to create your own document!</p>
            </div>
        </div>
    );
};

window.TextEditApp = TextEditApp;
