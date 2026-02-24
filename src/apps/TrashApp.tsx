// Trash App - functional trash bin with restore and empty
const TrashApp = () => {
    const vfsVersion = useStore(s => s.vfsVersion);
    const [selected, setSelected] = React.useState(null);
    const [confirmEmpty, setConfirmEmpty] = React.useState(false);

    const trashItems = VFS.getTrash();

    const handleRestore = (item) => {
        VFS.restoreFromTrash(item);
        setSelected(null);
    };

    const handleEmptyTrash = () => {
        VFS.emptyTrash();
        setConfirmEmpty(false);
        setSelected(null);
    };

    const selectedItem = trashItems.find(t => t.name === selected);

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-[200px] min-w-[200px] bg-gray-50/95 border-r border-black/5 p-3 flex flex-col">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-blue-500 text-white text-[13px] mb-2">
                    <span>🗑️</span>
                    <span>Trash</span>
                    <span className="ml-auto text-[11px] opacity-70">{trashItems.length}</span>
                </div>
                <div className="flex-1"/>
                {trashItems.length > 0 && (
                    <button
                        className="w-full px-3 py-2 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors"
                        onClick={() => setConfirmEmpty(true)}>
                        Empty Trash
                    </button>
                )}
            </div>

            {/* File list */}
            <div className="w-[300px] min-w-[300px] border-r border-black/5 overflow-y-auto bg-white">
                {trashItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-[48px] mb-3">🗑️</span>
                        <span className="text-[14px] font-medium text-gray-600">Trash is Empty</span>
                    </div>
                ) : (
                    trashItems.map((item, i) => (
                        <div key={i}
                            className={`flex items-center gap-3 px-4 py-2.5 border-b border-black/[0.04] cursor-default ${selected === item.name ? 'bg-blue-500/[0.08]' : 'hover:bg-black/[0.02]'}`}
                            onClick={() => setSelected(item.name)}>
                            <span className="text-[20px]">{item.icon || (item.type === 'dir' ? '📁' : '📄')}</span>
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium truncate">{item.name}</div>
                                <div className="text-[11px] text-gray-400">From: {item.originalPath.replace('/Users/user/', '~/')}</div>
                            </div>
                            <div className="text-[11px] text-gray-400">{item.size || ''}</div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail pane */}
            <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col items-center justify-center">
                {selectedItem ? (
                    <div className="text-center">
                        <span className="text-[64px] block mb-4">{selectedItem.icon || (selectedItem.type === 'dir' ? '📁' : '📄')}</span>
                        <h3 className="text-[16px] font-semibold mb-1 text-gray-800">{selectedItem.name}</h3>
                        <p className="text-[12px] text-gray-500 mb-1">Original location: {selectedItem.originalPath.replace('/Users/user/', '~/')}</p>
                        {selectedItem.size && <p className="text-[12px] text-gray-500 mb-1">Size: {selectedItem.size}</p>}
                        <p className="text-[12px] text-gray-500 mb-4">Deleted: {new Date(selectedItem.deletedAt).toLocaleString()}</p>
                        <div className="flex gap-2 justify-center">
                            <button className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600"
                                onClick={() => handleRestore(selectedItem)}>Put Back</button>
                            <button className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600"
                                onClick={() => { VFS.deleteFromTrash(selectedItem); setSelected(null); }}>Delete Permanently</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <span className="text-[48px] block mb-3">🗑️</span>
                        <p className="text-[14px] text-gray-600">{trashItems.length > 0 ? 'Select an item to see details' : 'No items in Trash'}</p>
                    </div>
                )}
            </div>

            {/* Confirm empty dialog */}
            {confirmEmpty && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 rounded-b-xl">
                    <div className="bg-white rounded-xl shadow-2xl p-5 w-[340px]">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-[36px]">🗑️</span>
                            <div>
                                <h3 className="text-[14px] font-bold">Empty Trash?</h3>
                                <p className="text-[12px] text-gray-500 mt-1">
                                    Are you sure you want to permanently erase the {trashItems.length} item{trashItems.length !== 1 ? 's' : ''} in the Trash? You can't undo this action.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button className="px-4 py-1.5 rounded-lg bg-gray-100 text-[13px] font-medium hover:bg-gray-200"
                                onClick={() => setConfirmEmpty(false)}>Cancel</button>
                            <button className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600"
                                onClick={handleEmptyTrash}>Empty Trash</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.TrashApp = TrashApp;
