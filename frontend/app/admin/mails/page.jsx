'use client'

import { useAuth } from "@/app/AuthProvider"
import Loading from "@/components/Loading"
import { fetchAdminContactMessagesApi, replyAdminContactMessageApi } from "@/lib/shopApi"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminMailsPage() {
    const { token } = useAuth()
    const [loading, setLoading] = useState(true)
    const [messages, setMessages] = useState([])
    const [replyingId, setReplyingId] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')

    const loadMessages = useCallback(async () => {
        if (!token) return
        setLoading(true)
        try {
            const response = await fetchAdminContactMessagesApi(token, {
                per_page: 100,
                search: search || undefined,
                status: status || undefined,
            })
            setMessages(response.messages)
        } catch (error) {
            toast.error(error.message || 'Failed to load messages.')
        } finally {
            setLoading(false)
        }
    }, [search, status, token])

    useEffect(() => {
        loadMessages()
    }, [loadMessages])

    const openReply = (message) => {
        setReplyingId(message.id)
        setReplyText(message.adminReply || '')
    }

    const cancelReply = () => {
        setReplyingId(null)
        setReplyText('')
    }

    const sendReply = async (messageId) => {
        await replyAdminContactMessageApi(token, messageId, replyText)
        cancelReply()
        await loadMessages()
    }

    if (loading) return <Loading label="Loading contact messages..." />

    return (
        <div className="space-y-6">
            <header className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                <h1 className="text-2xl font-bold">Contact Messages</h1>
                <p className="mt-1 text-sm text-slate-300">Review support requests and send replies directly from the dashboard.</p>
            </header>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, email, or subject..."
                        className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                    />
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="replied">Replied</option>
                    </select>
                    <button
                        onClick={loadMessages}
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Apply
                    </button>
                </div>
            </section>

            <section className="grid gap-3">
                {messages.map((message) => (
                    <article key={message.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold text-slate-900">{message.subject}</p>
                                <p className="mt-1 text-sm text-slate-700">{message.name} · {message.email}</p>
                                <p className="mt-1 text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${message.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {message.status}
                            </span>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                            {message.message}
                        </p>

                        {replyingId === message.id ? (
                            <div className="mt-3 space-y-2">
                                <textarea
                                    rows={5}
                                    value={replyText}
                                    onChange={(event) => setReplyText(event.target.value)}
                                    className="w-full resize-none rounded border border-slate-300 p-3 text-sm outline-none focus:border-blue-600"
                                    placeholder="Write your reply..."
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toast.promise(sendReply(message.id), { loading: 'Sending reply...' })}
                                        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Send reply
                                    </button>
                                    <button
                                        onClick={cancelReply}
                                        className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-3">
                                {message.adminReply ? (
                                    <div className="rounded border border-blue-200 bg-blue-50 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">Admin Reply</p>
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{message.adminReply}</p>
                                        {message.repliedAt && (
                                            <p className="mt-1 text-xs text-slate-500">{new Date(message.repliedAt).toLocaleString()}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No reply sent yet.</p>
                                )}
                                <button
                                    onClick={() => openReply(message)}
                                    className="mt-2 rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                                >
                                    {message.status === 'replied' ? 'Edit reply' : 'Reply now'}
                                </button>
                            </div>
                        )}
                    </article>
                ))}

                {messages.length === 0 && (
                    <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                        No messages found.
                    </article>
                )}
            </section>
        </div>
    )
}
