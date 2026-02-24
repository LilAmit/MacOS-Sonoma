// Calculator Button - defined outside to prevent remount on parent re-render
const CalcButton = ({ label, onClick, type = 'number', span = 1, activeOp }) => {
    const isActive = type === 'operator' && activeOp === label;
    const bgClass = type === 'number' ? 'bg-[#505050] hover:bg-[#6a6a6a] text-white'
        : type === 'operator' ? (isActive ? 'bg-white text-[#FF9500]' : 'bg-[#FF9500] hover:bg-[#FFa833] text-white')
        : 'bg-[#a5a5a5] hover:bg-[#b5b5b5] text-[#333]';

    return (
        <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClick}
            className={`${bgClass} flex items-center text-[22px] h-full rounded-none active:brightness-125 transition-all cursor-default
                ${span > 1 ? 'col-span-2 justify-start pl-7' : 'justify-center'}`}
            style={{ fontFamily: 'Inter, sans-serif' }}
        >
            {label}
        </button>
    );
};

// Calculator App - Fully functional with expression display
const CalculatorApp = () => {
    const [display, setDisplay] = React.useState('0');
    const [expression, setExpression] = React.useState('');
    const [firstOperand, setFirstOperand] = React.useState(null);
    const [operator, setOperator] = React.useState(null);
    const [waitingForSecond, setWaitingForSecond] = React.useState(false);
    const [activeOp, setActiveOp] = React.useState(null);

    const inputNumber = (num) => {
        if (waitingForSecond) {
            setDisplay(String(num));
            setExpression(prev => prev + ' ' + num);
            setWaitingForSecond(false);
            setActiveOp(null);
        } else {
            const newDisplay = display === '0' ? String(num) : display + num;
            setDisplay(newDisplay);
            if (expression === '' || expression === '0') {
                setExpression(String(num));
            } else if (operator && expression.endsWith(' ')) {
                setExpression(prev => prev + num);
            } else {
                setExpression(prev => prev + num);
            }
        }
    };

    const inputDecimal = () => {
        if (waitingForSecond) {
            setDisplay('0.');
            setExpression(prev => prev + ' 0.');
            setWaitingForSecond(false);
            return;
        }
        if (!display.includes('.')) {
            setDisplay(display + '.');
            setExpression(prev => prev + '.');
        }
    };

    const calculate = (a, b, op) => {
        switch(op) {
            case '+': return a + b;
            case '−': return a - b;
            case '×': return a * b;
            case '÷': return b !== 0 ? a / b : 'Error';
            default: return b;
        }
    };

    const inputOperator = (op) => {
        const current = parseFloat(display);
        if (firstOperand !== null && !waitingForSecond) {
            const result = calculate(firstOperand, current, operator);
            setDisplay(String(result));
            setFirstOperand(result);
            setExpression(String(result) + ' ' + op);
        } else {
            setFirstOperand(current);
            setExpression(current + ' ' + op);
        }
        setOperator(op);
        setWaitingForSecond(true);
        setActiveOp(op);
    };

    const inputEquals = () => {
        if (!operator || waitingForSecond) return;
        const second = parseFloat(display);
        const result = calculate(firstOperand, second, operator);
        setExpression(firstOperand + ' ' + operator + ' ' + second + ' =');
        setDisplay(String(result));
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecond(false);
        setActiveOp(null);
    };

    const clear = () => {
        setDisplay('0');
        setExpression('');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecond(false);
        setActiveOp(null);
    };

    const toggleSign = () => {
        const val = String(-parseFloat(display));
        setDisplay(val);
    };
    const percent = () => {
        const val = String(parseFloat(display) / 100);
        setDisplay(val);
    };

    // Format display number
    let displayText = display;
    if (displayText !== 'Error' && !isNaN(displayText) && displayText.length > 12) {
        displayText = parseFloat(displayText).toPrecision(9);
    }
    const fontSize = displayText.length > 9 ? 'text-[32px]' : displayText.length > 7 ? 'text-[40px]' : 'text-[48px]';

    return (
        <div className="flex flex-col h-full bg-[#333]">
            <div className="px-6 pt-3 pb-1 text-right bg-[#333]">
                <div className="text-[14px] text-gray-400 min-h-[20px] overflow-hidden text-right truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {expression}
                </div>
                <div className={`${fontSize} font-light text-white min-h-[54px] flex items-center justify-end overflow-hidden`}>
                    {displayText}
                </div>
            </div>
            <div className="grid grid-cols-4 gap-px flex-1">
                <CalcButton label="AC" onClick={clear} type="function" activeOp={activeOp}/>
                <CalcButton label="±" onClick={toggleSign} type="function" activeOp={activeOp}/>
                <CalcButton label="%" onClick={percent} type="function" activeOp={activeOp}/>
                <CalcButton label="÷" onClick={() => inputOperator('÷')} type="operator" activeOp={activeOp}/>

                <CalcButton label="7" onClick={() => inputNumber(7)} activeOp={activeOp}/>
                <CalcButton label="8" onClick={() => inputNumber(8)} activeOp={activeOp}/>
                <CalcButton label="9" onClick={() => inputNumber(9)} activeOp={activeOp}/>
                <CalcButton label="×" onClick={() => inputOperator('×')} type="operator" activeOp={activeOp}/>

                <CalcButton label="4" onClick={() => inputNumber(4)} activeOp={activeOp}/>
                <CalcButton label="5" onClick={() => inputNumber(5)} activeOp={activeOp}/>
                <CalcButton label="6" onClick={() => inputNumber(6)} activeOp={activeOp}/>
                <CalcButton label="−" onClick={() => inputOperator('−')} type="operator" activeOp={activeOp}/>

                <CalcButton label="1" onClick={() => inputNumber(1)} activeOp={activeOp}/>
                <CalcButton label="2" onClick={() => inputNumber(2)} activeOp={activeOp}/>
                <CalcButton label="3" onClick={() => inputNumber(3)} activeOp={activeOp}/>
                <CalcButton label="+" onClick={() => inputOperator('+')} type="operator" activeOp={activeOp}/>

                <CalcButton label="0" onClick={() => inputNumber(0)} span={2} activeOp={activeOp}/>
                <CalcButton label="." onClick={inputDecimal} activeOp={activeOp}/>
                <CalcButton label="=" onClick={inputEquals} type="operator" activeOp={activeOp}/>
            </div>
        </div>
    );
};

window.CalcButton = CalcButton;
window.CalculatorApp = CalculatorApp;
