'use client'

import { useAuth } from "@/app/AuthProvider"
import Loading from "@/components/Loading"
import { fetchMyContactMessagesApi, sendContactMessageApi } from "@/lib/shopApi"
import { Clock3Icon, MailIcon, PhoneIcon, ShieldCheckIcon } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function ContactPage() {
    const { token, user } = useAuth()
    const [submitting, setSubmitting] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [messages, setMessages] = useState([])
    const [form, setForm] = useState({
        subject: '',
        message: '',
    })

    const onChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const loadMessages = useCallback(async () => {
        if (!token) {
            setMessages([])
            return
        }

        setLoadingMessages(true)
        try {
            const response = await fetchMyContactMessagesApi(token)
            setMessages(response)
        } catch (error) {
            toast.error(error.message || 'Failed to load your messages.')
        } finally {
            setLoadingMessages(false)
        }
    }, [token])

    useEffect(() => {
        loadMessages()
    }, [loadMessages])

    const onSubmit = async (event) => {
        event.preventDefault()
        if (!token) {
            toast.error('Please login to send a message.')
            return
        }

        setSubmitting(true)
        try {
            await sendContactMessageApi(token, form)
            toast.success('Your message was sent successfully.')
            setForm({ subject: '', message: '' })
            await loadMessages()
        } catch (error) {
            toast.error(error.message || 'Unable to send message.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-white">
            <section className="bg-blue-600">
                <div className="container-electronics py-14 text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Support Center</p>
                    <h1 className="mt-2 text-4xl font-extrabold">We are here to help</h1>
                    <p className="mt-3 max-w-2xl text-sm text-blue-100">
                        Ask about orders, products, payments, or account access. Our team responds quickly with clear solutions.
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-blue-400 bg-blue-700/50 p-4">
                            <Clock3Icon size={16} />
                            <p className="mt-2 text-sm font-semibold">Response time</p>
                            <p className="text-xs text-blue-100">Usually within 24 hours</p>
                        </div>
                        <div className="rounded-lg border border-blue-400 bg-blue-700/50 p-4">
                            <MailIcon size={16} />
                            <p className="mt-2 text-sm font-semibold">Email support</p>
                            <p className="text-xs text-blue-100">support@singitronic.local</p>
                        </div>
                        <div className="rounded-lg border border-blue-400 bg-blue-700/50 p-4">
                            <PhoneIcon size={16} />
                            <p className="mt-2 text-sm font-semibold">Phone support</p>
                            <p className="text-xs text-blue-100">+1-212-456-7890</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container-electronics grid gap-6 py-10 lg:grid-cols-[1fr_1.2fr]">
                <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Send a message</h2>
                    {token ? (
                        <p className="mt-2 text-sm text-slate-600">
                            Signed in as <span className="font-semibold text-slate-900">{user?.name || 'User'}</span> ({user?.email})
                        </p>
                    ) : (
                        <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                            Please{' '}
                            <Link href="/login?redirect=/contact" className="font-semibold underline">
                                login
                            </Link>{' '}
                            to submit a support request.
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="mt-4 space-y-3">
                        <input
                            name="subject"
                            value={form.subject}
                            onChange={onChange}
                            required
                            maxLength={180}
                            disabled={!token || submitting}
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 disabled:bg-slate-100"
                            placeholder="Subject"
                        />
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={onChange}
                            required
                            maxLength={5000}
                            rows={8}
                            disabled={!token || submitting}
                            className="w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 disabled:bg-slate-100"
                            placeholder="Message"
                        />
                        <button
                            type="submit"
                            disabled={!token || submitting}
                            className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? 'Sending...' : 'Send message'}
                        </button>
                    </form>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheckIcon size={18} className="text-blue-600" />
                        <h2 className="text-xl font-bold text-slate-900">Your message history</h2>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Track sent requests and admin replies in one place.</p>

                    {!token ? (
                        <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            Login to view your support inbox.
                        </div>
                    ) : loadingMessages ? (
                        <div className="mt-5">
                            <Loading fullScreen={false} label="Loading messages..." />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                            No messages yet.
                        </div>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {messages.map((item) => (
                                <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="font-semibold text-slate-900">{item.subject}</p>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.message}</p>
                                    <p className="mt-2 text-xs text-slate-500">Sent: {new Date(item.createdAt).toLocaleString()}</p>

                                    {item.adminReply ? (
                                        <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3">
                                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">Admin reply</p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{item.adminReply}</p>
                                            {item.repliedAt && (
                                                <p className="mt-1 text-xs text-slate-500">{new Date(item.repliedAt).toLocaleString()}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-xs text-slate-500">Awaiting admin reply.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            </section>
        </div>
    )
}
