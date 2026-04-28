'use client'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Title = ({ title, description, visibleButton = true, href = '', align = 'center' }) => {
    const isLeftAligned = align === 'left'
    const alignmentClass = isLeftAligned ? 'items-start' : 'items-center'
    const textAlignmentClass = isLeftAligned ? 'text-left' : 'text-center'

    return (
        <div className={`flex flex-col ${alignmentClass}`}>
            <h2 className={`text-2xl font-semibold text-slate-800 ${textAlignmentClass}`}>{title}</h2>
            <Link href={href} className='flex items-center gap-5 text-sm text-slate-600 mt-2'>
                <p className={`max-w-lg ${textAlignmentClass}`}>{description}</p>
                {visibleButton && <button className='text-green-500 flex items-center gap-1'>View more <ArrowRight size={14} /></button>}
            </Link>
        </div>
    )
}

export default Title
