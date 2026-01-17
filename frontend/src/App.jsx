import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Mail,
  RefreshCw,
  Bell,
  FileText,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || ''

function App() {
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)
  const [emailStatus, setEmailStatus] = useState('')
  const [filterKeywords, setFilterKeywords] = useState('')
  const [autoCheck, setAutoCheck] = useState(false)
  const [selectedTenders, setSelectedTenders] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadTendersFromStorage()
  }, [])

  useEffect(() => {
    if (!autoCheck) return
    const interval = setInterval(() => {
      fetchTenders()
    }, 24 * 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [autoCheck])

  const loadTendersFromStorage = () => {
    try {
      const raw = localStorage.getItem('bihar-tenders')
      if (!raw) return
      const data = JSON.parse(raw)
      setTenders(data.tenders || [])
      setLastChecked(data.lastChecked || null)
    } catch {
      // ignore
    }
  }

  const saveTendersToStorage = (tendersData) => {
    try {
      localStorage.setItem(
        'bihar-tenders',
        JSON.stringify({
          tenders: tendersData,
          lastChecked: new Date().toISOString()
        })
      )
    } catch {
      // ignore
    }
  }

  const mapTender = (t) => {
    const id = t.id || t.tenderNumber || t.referenceNumber || `TN-${crypto.randomUUID()}`
    const title = t.title || t.description || t.name || 'Untitled Tender'
    return {
      id,
      title,
      department: t.department || t.organization || 'Bihar Government',
      deadline: t.bidSubmissionDate || t.deadline || null,
      value: t.tenderValue || t.value || null,
      description: t.description || '',
      fetchedAt: t.fetchedAt || new Date().toISOString()
    }
  }

  const fetchTenders = async () => {
    setLoading(true)
    setErrorMessage('')
    setEmailStatus('Fetching tenders...')

    try {
      const response = await fetch(`${API_BASE}/api/tenders`)
      if (!response.ok) {
        throw new Error('Failed to fetch tenders')
      }
      const data = await response.json()
      const mapped = Array.isArray(data) ? data.map(mapTender) : []
      const timestampedTenders = mapped.map((t) => ({
        ...t,
        fetchedAt: new Date().toISOString()
      }))

      setTenders(timestampedTenders)
      setLastChecked(new Date().toISOString())
      saveTendersToStorage(timestampedTenders)
      setEmailStatus('Tenders fetched successfully!')
    } catch (error) {
      setErrorMessage(error?.message || 'Error fetching tenders')
      setEmailStatus('Error fetching tenders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const parseValue = (value) => {
    if (!value) return null
    const numeric = Number(String(value).replace(/[^0-9.]/g, ''))
    return Number.isFinite(numeric) ? numeric : null
  }

  const analyzeTenders = (tendersToAnalyze) => {
    const totalTenders = tendersToAnalyze.length
    const highValue = tendersToAnalyze.filter((t) => {
      const parsed = parseValue(t.value)
      return parsed && parsed > 1000000
    }).length
    const urgentDeadlines = tendersToAnalyze.filter((t) => {
      if (!t.deadline) return false
      const deadline = new Date(t.deadline)
      if (Number.isNaN(deadline.getTime())) return false
      const daysUntil = (deadline - new Date()) / (1000 * 60 * 60 * 24)
      return daysUntil <= 7 && daysUntil >= 0
    }).length
    const departments = new Set(tendersToAnalyze.map((t) => t.department)).size

    return { totalTenders, highValue, urgentDeadlines, departments }
  }

  const sendEmailBrief = async () => {
    const emailTenders = selectedTenders.length > 0
      ? tenders.filter((t) => selectedTenders.includes(t.id))
      : tenders

    if (emailTenders.length === 0) {
      setEmailStatus('No tenders to email')
      return
    }

    setEmailStatus('Sending email brief...')
    try {
      const response = await fetch(`${API_BASE}/api/notifications/brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderIds: selectedTenders.length > 0 ? selectedTenders : undefined,
          limit: 20
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email brief')
      }

      setEmailStatus('Email brief sent successfully.')
    } catch (error) {
      setEmailStatus(error?.message || 'Failed to send email brief')
    }
  }

  const filteredTenders = useMemo(() => {
    if (!filterKeywords) return tenders
    const keywords = filterKeywords
      .toLowerCase()
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)

    return tenders.filter((tender) => {
      const searchText = `${tender.title} ${tender.department} ${tender.description}`.toLowerCase()
      return keywords.some((keyword) => searchText.includes(keyword))
    })
  }, [tenders, filterKeywords])

  const toggleTenderSelection = (tenderId) => {
    setSelectedTenders((prev) =>
      prev.includes(tenderId) ? prev.filter((id) => id !== tenderId) : [...prev, tenderId]
    )
  }

  const exportSelected = () => {
    const exportData = selectedTenders.length > 0
      ? tenders.filter((t) => selectedTenders.includes(t.id))
      : filteredTenders

    if (exportData.length === 0) {
      setEmailStatus('No tenders to export')
      return
    }

    const csvRows = [
      ['ID', 'Title', 'Department', 'Deadline', 'Value', 'Fetched At'].join(','),
      ...exportData.map((t) => [
        t.id,
        t.title.replace(/,/g, ' '),
        t.department.replace(/,/g, ' '),
        t.deadline || '',
        t.value || '',
        t.fetchedAt
      ].join(','))
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bihar-tenders-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <div className="app__container">
        <header className="card header">
          <div className="header__content">
            <div>
              <h1>
                <FileText className="icon" />
                Bihar Tender Monitor
              </h1>
              <p className="subtitle">Automated tender tracking and analysis</p>
            </div>
            <div className="header__meta">
              <p className="meta">Email: tender.rudrapriyam@gmail.com</p>
              {lastChecked && (
                <p className="meta muted">
                  Last checked: {new Date(lastChecked).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="controls">
            <button
              onClick={fetchTenders}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <RefreshCw className="spin" size={18} />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Fetch Latest Tenders
                </>
              )}
            </button>

            <button
              onClick={sendEmailBrief}
              disabled={tenders.length === 0}
              className="btn btn-success"
            >
              <Mail size={18} />
              Generate Email Brief
            </button>

            <button
              onClick={exportSelected}
              disabled={tenders.length === 0}
              className="btn btn-outline"
            >
              <Download size={18} />
              Export CSV
            </button>

            <button
              onClick={() => setAutoCheck(!autoCheck)}
              className={`btn ${autoCheck ? 'btn-warning' : 'btn-muted'}`}
            >
              <Bell size={18} />
              Auto-Check {autoCheck ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="filter">
            <Search className="filter__icon" size={18} />
            <input
              type="text"
              placeholder="Filter by keywords (comma-separated): construction, road, bridge..."
              value={filterKeywords}
              onChange={(e) => setFilterKeywords(e.target.value)}
            />
          </div>
        </header>

        {(emailStatus || errorMessage) && (
          <section className="card status">
            {errorMessage && <p className="status__error">{errorMessage}</p>}
            {emailStatus && (
              <pre className="status__message">{emailStatus}</pre>
            )}
          </section>
        )}

        {tenders.length > 0 && (
          <section className="stats">
            <div className="card stat">
              <p>Total Tenders</p>
              <h3>{filteredTenders.length}</h3>
            </div>
            <div className="card stat">
              <p>Selected</p>
              <h3>{selectedTenders.length}</h3>
            </div>
            <div className="card stat">
              <p>Departments</p>
              <h3>{[...new Set(filteredTenders.map((t) => t.department))].length}</h3>
            </div>
            <div className="card stat">
              <p>Auto-Check</p>
              <h3>{autoCheck ? 'ON' : 'OFF'}</h3>
            </div>
          </section>
        )}

        <section className="card list">
          <div className="list__header">
            <h2>
              <Filter size={18} /> Tenders ({filteredTenders.length})
            </h2>
            <div className="list__meta">
              <Calendar size={16} />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {filteredTenders.length === 0 ? (
            <div className="empty">
              <FileText size={42} />
              <p>No tenders found. Click “Fetch Latest Tenders” to begin.</p>
            </div>
          ) : (
            <div className="list__grid">
              {filteredTenders.map((tender) => (
                <article
                  key={tender.id}
                  className={`tender ${selectedTenders.includes(tender.id) ? 'selected' : ''}`}
                >
                  <div className="tender__select">
                    <input
                      type="checkbox"
                      checked={selectedTenders.includes(tender.id)}
                      onChange={() => toggleTenderSelection(tender.id)}
                    />
                  </div>
                  <div className="tender__content">
                    <h3>{tender.title}</h3>
                    <div className="tender__details">
                      <span><strong>ID:</strong> {tender.id}</span>
                      <span><strong>Department:</strong> {tender.department}</span>
                      <span><strong>Deadline:</strong> {tender.deadline || 'N/A'}</span>
                      {tender.value && (
                        <span><strong>Value:</strong> ₹{tender.value}</span>
                      )}
                    </div>
                    {tender.description && (
                      <p className="tender__description">{tender.description}</p>
                    )}
                    <p className="tender__meta">Fetched: {new Date(tender.fetchedAt).toLocaleString()}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          <p>Data source: Bihar E-Procurement Portal</p>
          <a
            href="https://eproc2.bihar.gov.in/EPSV2Web/openarea/tenderListingPage.action#latestTenders"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Official Website
          </a>
        </footer>
      </div>
    </div>
  )
}

export default App
