// Paint App - Canvas drawing application with Save To Mac
const PaintApp = () => {
    const canvasRef = React.useRef(null);
    const [tool, setTool] = React.useState('brush');
    const [color, setColor] = React.useState('#000000');
    const [brushSize, setBrushSize] = React.useState(4);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [history, setHistory] = React.useState([]);
    const [historyIdx, setHistoryIdx] = React.useState(-1);
    const [fillColor, setFillColor] = React.useState('#ffffff');
    const [showSaveDialog, setShowSaveDialog] = React.useState(false);
    const [savePath, setSavePath] = React.useState('/Users/user/Desktop');
    const [saveFileName, setSaveFileName] = React.useState('painting.png');
    const lastPos = React.useRef(null);
    const shapeStart = React.useRef(null);
    const snapshotRef = React.useRef(null);
    const vfsVersion = useStore(s => s.vfsVersion);

    const presetColors = [
        '#000000', '#ffffff', '#ff0000', '#ff6600', '#ffcc00', '#33cc33',
        '#0099ff', '#6633cc', '#ff3399', '#996633', '#666666', '#cccccc',
        '#990000', '#cc6600', '#999900', '#006633', '#003399', '#330066',
        '#cc0066', '#663300', '#333333', '#999999',
    ];

    const tools = [
        { id: 'brush', label: 'Brush', icon: 'M7 14c-1.66 0-3-1.34-3-3 0-1.31.83-2.5 2.03-2.94L12 2l5.97 6.06C19.17 8.5 20 9.69 20 11c0 1.66-1.34 3-3 3H7z' },
        { id: 'eraser', label: 'Eraser', icon: 'M15.14 3c-.51 0-1.01.2-1.38.56L2.44 14.89c-.78.77-.78 2.03 0 2.81l1.06 1.06c.39.39.9.59 1.41.59H9l9.56-9.56c.78-.78.78-2.05 0-2.83l-2.03-2.03A1.948 1.948 0 0015.14 3z' },
        { id: 'line', label: 'Line', icon: 'M4 20L20 4' },
        { id: 'rect', label: 'Rect', icon: 'M3 5v14h18V5H3zm16 12H5V7h14v10z' },
        { id: 'circle', label: 'Circle', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z' },
        { id: 'fill', label: 'Fill', icon: 'M16.56 8.94L7.62 0 6.21 1.42l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.13zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z' },
        { id: 'text', label: 'Text', icon: 'M5 4v3h5.5v12h3V7H19V4z' },
    ];

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    }, []);

    const saveState = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const data = canvas.toDataURL();
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIdx + 1);
            newHistory.push(data);
            setHistoryIdx(newHistory.length - 1);
            return newHistory;
        });
    };

    const undo = () => {
        if (historyIdx <= 0) return;
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        const img = new Image();
        img.onload = () => {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = history[newIdx];
    };

    const redo = () => {
        if (historyIdx >= history.length - 1) return;
        const newIdx = historyIdx + 1;
        setHistoryIdx(newIdx);
        const img = new Image();
        img.onload = () => {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = history[newIdx];
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        saveState();
    };

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const handleMouseDown = (e) => {
        const pos = getPos(e);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (tool === 'fill') {
            floodFill(Math.round(pos.x), Math.round(pos.y), color);
            saveState();
            return;
        }

        if (tool === 'text') {
            const text = prompt('Enter text:');
            if (text) {
                ctx.font = `${brushSize * 4}px Inter, sans-serif`;
                ctx.fillStyle = color;
                ctx.fillText(text, pos.x, pos.y);
                saveState();
            }
            return;
        }

        setIsDrawing(true);
        lastPos.current = pos;

        if (tool === 'line' || tool === 'rect' || tool === 'circle') {
            shapeStart.current = pos;
            snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } else {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, (tool === 'eraser' ? brushSize * 2 : brushSize) / 2, 0, Math.PI * 2);
            ctx.fillStyle = tool === 'eraser' ? fillColor : color;
            ctx.fill();
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const pos = getPos(e);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (tool === 'brush' || tool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = tool === 'eraser' ? fillColor : color;
            ctx.lineWidth = tool === 'eraser' ? brushSize * 2 : brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            lastPos.current = pos;
        } else if (shapeStart.current && snapshotRef.current) {
            ctx.putImageData(snapshotRef.current, 0, 0);
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            const sx = shapeStart.current.x, sy = shapeStart.current.y;

            if (tool === 'line') {
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            } else if (tool === 'rect') {
                ctx.strokeRect(sx, sy, pos.x - sx, pos.y - sy);
            } else if (tool === 'circle') {
                const rx = Math.abs(pos.x - sx) / 2;
                const ry = Math.abs(pos.y - sy) / 2;
                const cx = sx + (pos.x - sx) / 2;
                const cy = sy + (pos.y - sy) / 2;
                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    };

    const handleMouseUp = () => {
        if (isDrawing) {
            setIsDrawing(false);
            shapeStart.current = null;
            snapshotRef.current = null;
            saveState();
        }
    };

    const floodFill = (startX, startY, fillColorHex) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width, h = canvas.height;

        const fc = parseInt(fillColorHex.slice(1), 16);
        const fr = (fc >> 16) & 255, fg = (fc >> 8) & 255, fb = fc & 255;

        const getPixel = (x, y) => {
            const i = (y * w + x) * 4;
            return [data[i], data[i+1], data[i+2], data[i+3]];
        };

        const target = getPixel(startX, startY);
        if (target[0] === fr && target[1] === fg && target[2] === fb) return;

        const match = (x, y) => {
            const p = getPixel(x, y);
            return Math.abs(p[0] - target[0]) < 20 && Math.abs(p[1] - target[1]) < 20 && Math.abs(p[2] - target[2]) < 20;
        };

        const setPixel = (x, y) => {
            const i = (y * w + x) * 4;
            data[i] = fr; data[i+1] = fg; data[i+2] = fb; data[i+3] = 255;
        };

        const stack = [[startX, startY]];
        const visited = new Set();
        let maxOps = 500000;

        while (stack.length > 0 && maxOps-- > 0) {
            const [x, y] = stack.pop();
            if (x < 0 || x >= w || y < 0 || y >= h) continue;
            const key = y * w + x;
            if (visited.has(key)) continue;
            if (!match(x, y)) continue;
            visited.add(key);
            setPixel(x, y);
            stack.push([x+1,y], [x-1,y], [x,y+1], [x,y-1]);
        }

        ctx.putImageData(imageData, 0, 0);
    };

    const downloadImage = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'painting.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    const openSaveDialog = () => {
        setSavePath('/Users/user/Desktop');
        setSaveFileName('painting.png');
        setShowSaveDialog(true);
    };

    const saveToMac = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL();
        // Save the data URL as file content in VFS
        VFS.touch(savePath, saveFileName, dataUrl);
        MacStore.addNotification('Paint', 'File Saved', saveFileName + ' saved to ' + savePath.replace('/Users/user', '~'));
        setShowSaveDialog(false);
    };

    const saveFolders = VFS.ls(savePath).filter(f => f.type === 'folder');

    return (
        <div className="flex flex-col h-full bg-[#f0f0f0]">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 flex-wrap">
                {/* Tools */}
                <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
                    {tools.map(t => (
                        <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
                            className={`p-1.5 rounded-md ${tool === t.id ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill={tool === t.id ? 'white' : '#555'}>
                                {t.id === 'line' ? <line x1="4" y1="20" x2="20" y2="4" stroke={tool === t.id ? 'white' : '#555'} strokeWidth="2"/> : <path d={t.icon}/>}
                            </svg>
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-gray-300"/>

                {/* Size */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500">Size</span>
                    <MacSlider min={1} max={40} value={brushSize} onChange={v => setBrushSize(v)}
                        className="w-[80px]" accentColor="#3b82f6"/>
                    <span className="text-[10px] text-gray-500 w-5">{brushSize}</span>
                </div>

                <div className="w-px h-6 bg-gray-300"/>

                {/* Color */}
                <div className="flex items-center gap-1.5">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border border-gray-300" title="Color"/>
                    <div className="flex gap-0.5 flex-wrap" style={{ maxWidth: '200px' }}>
                        {presetColors.map(c => (
                            <button key={c} onClick={() => setColor(c)}
                                className={`w-4 h-4 rounded-sm border ${color === c ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}`}
                                style={{ background: c }}/>
                        ))}
                    </div>
                </div>

                <div className="w-px h-6 bg-gray-300"/>

                {/* Actions */}
                <button onClick={undo} className="p-1.5 rounded hover:bg-gray-100" title="Undo">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#555"><path d="M12.5 8c-2.65 0-5.05 1.04-6.83 2.74L2.5 7.5v9h9l-3.19-3.19c1.33-1.28 3.07-2.06 5.04-2.06 3.24 0 6.02 2.07 7.05 5l2.1-.66C21.11 11.97 17.14 8 12.5 8z"/></svg>
                </button>
                <button onClick={redo} className="p-1.5 rounded hover:bg-gray-100" title="Redo">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#555"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
                </button>
                <button onClick={clearCanvas} className="px-2 py-1 rounded text-[11px] text-gray-600 hover:bg-gray-100 font-medium" title="Clear canvas">Clear</button>
                <button onClick={downloadImage} className="px-2 py-1 rounded text-[11px] text-blue-600 hover:bg-blue-50 font-medium">Save PNG</button>
                <button onClick={openSaveDialog} className="px-2 py-1 rounded text-[11px] text-white bg-blue-500 hover:bg-blue-600 font-medium">Save To Mac</button>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#e0e0e0]"
                style={{ backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <canvas
                    ref={canvasRef}
                    width={900}
                    height={600}
                    className="bg-white shadow-lg rounded cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
            </div>

            {/* Status bar */}
            <div className="h-[22px] bg-white border-t border-gray-200 flex items-center px-3 text-[11px] text-gray-500 gap-4">
                <span>Tool: {tools.find(t => t.id === tool)?.label}</span>
                <span>Size: {brushSize}px</span>
                <span>Canvas: 900 x 600</span>
                <span className="ml-auto">Paint</span>
            </div>

            {/* Save To Mac Dialog */}
            {showSaveDialog && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 rounded-b-xl">
                    <div className="bg-white rounded-xl shadow-2xl w-[420px] overflow-hidden">
                        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-[14px] font-semibold text-gray-800">Save To Mac</h3>
                            <button onClick={() => setShowSaveDialog(false)} className="text-gray-400 hover:text-gray-600 text-[18px]">&times;</button>
                        </div>
                        <div className="p-4">
                            <div className="text-[12px] text-gray-500 mb-2">Save to: {savePath.replace('/Users/user', '~')}</div>
                            <div className="border border-gray-200 rounded-lg h-[200px] overflow-y-auto mb-3 bg-gray-50">
                                {savePath !== '/Users/user' && (
                                    <div className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-default border-b border-gray-100"
                                        onClick={() => { const parts = savePath.split('/'); parts.pop(); setSavePath(parts.join('/') || '/Users/user'); }}>
                                        <span className="text-[14px]">⬆️</span>
                                        <span className="text-[12px] text-blue-600 font-medium">Go Up</span>
                                    </div>
                                )}
                                {saveFolders.length === 0 && (
                                    <div className="text-[12px] text-gray-400 text-center py-8">No subfolders</div>
                                )}
                                {saveFolders.map(folder => (
                                    <div key={folder.name}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-default border-b border-gray-100"
                                        onDoubleClick={() => setSavePath(savePath + '/' + folder.name)}>
                                        <svg viewBox="0 0 48 48" width="20" height="20">
                                            <path d="M6 8h14l4 4h18c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="#64B5F6"/>
                                            <rect x="4" y="14" width="40" height="24" rx="2" fill="#42A5F5" opacity="0.85"/>
                                        </svg>
                                        <span className="text-[12px] text-gray-700">{folder.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[12px] text-gray-500 whitespace-nowrap">File name:</span>
                                <input type="text" value={saveFileName} onChange={e => setSaveFileName(e.target.value)}
                                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowSaveDialog(false)}
                                    className="px-4 py-1.5 rounded-lg bg-gray-100 text-[13px] font-medium hover:bg-gray-200">Cancel</button>
                                <button onClick={saveToMac}
                                    className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.PaintApp = PaintApp;
