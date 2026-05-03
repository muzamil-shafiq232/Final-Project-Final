'use client'

const Loading = ({ fullScreen = true, label = 'Loading...' }) => {

    return (
        <div className={`${fullScreen ? 'min-h-screen' : 'min-h-[280px]'} flex flex-col items-center justify-center gap-4`}>
            <div className="relative">
                <div className='h-14 w-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin'></div>
                <div className="absolute inset-2 rounded-full border-2 border-cyan-100 border-b-cyan-500 animate-spin [animation-direction:reverse]"></div>
            </div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
        </div>
    )
}

export default Loading
