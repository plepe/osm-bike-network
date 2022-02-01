const Events = require('events')
const sprintf = require('sprintf-js').sprintf

function daysMonth (y, m) {
  m++
  if (m > 12) {
    y++
    m = 1
  }

  return new Date(new Date(sprintf('%04d-%02d-01', y, m)).getTime() - 86400000).getDate()
}

class DateSelector extends Events {
  init () {
    this.dom = document.getElementById('date-selector')
    this.dom.onsubmit = () => {
      return false
    }

    if (!this.value()) {
      this.set(new Date().toISOString())
    }

    ['year', 'month', 'day'].forEach(k => {
      this.dom.elements[k].onchange = () => this.dateChange()
      this.dom.elements[k + '-prev'].onclick = () => this.datePrev(k)
      this.dom.elements[k + '-next'].onclick = () => this.dateNext(k)
    })
  }

  dateChange () {
    this.emit('change', this.value())
  }

  datePrev (k) {
    let y = parseInt(this.dom.elements.year.value)
    let m = parseInt(this.dom.elements.month.value)
    let d = parseInt(this.dom.elements.day.value)
    let date

    switch (k) {
      case 'year':
        this.dom.elements.year.value = y - 1
        this.dateChange()
        break
      case 'month':
        if (m === 1) {
          this.dom.elements.month.value = 12
          this.dom.elements.year.value = y - 1
        } else {
          this.dom.elements.month.value = m - 1
        }

        const maxDays = daysMonth(this.dom.elements.year.value, this.dom.elements.month.value)
        if (d > maxDays) {
          this.dom.elements.day.value = maxDays
        }

        this.dateChange()
        break
      case 'day':
        date = new Date(this.value())
        date = new Date(date.getTime() - 86400000)
        this.set(date)
    }
  }

  dateNext (k) {
    let y = parseInt(this.dom.elements.year.value)
    let m = parseInt(this.dom.elements.month.value)
    let d = parseInt(this.dom.elements.day.value)
    let date

    switch (k) {
      case 'year':
        this.dom.elements.year.value = y + 1
        this.dateChange()
        break
      case 'month':
        if (m === 12) {
          this.dom.elements.month.value = 1
          this.dom.elements.year.value = y + 1
        } else {
          this.dom.elements.month.value = m + 1
        }

        const maxDays = daysMonth(this.dom.elements.year.value, this.dom.elements.month.value)
        if (d > maxDays) {
          this.dom.elements.day.value = maxDays
        }

        this.dateChange()
        break
      case 'day':
        date = new Date(this.value() + 'T12:00:00Z')
        date = new Date(date.getTime() + 86400000)
        this.set(date)
    }
  }

  dateNext (k) {
    let v

    switch (k) {
      case 'year':
        this.dom.elements.year.value = parseInt(this.dom.elements.year.value) + 1
        this.dateChange()
        break
      case 'month':
        v = parseInt(this.dom.elements.month.value)
        if (v === 12) {
          this.dom.elements.month.value = 1
          this.dom.elements.year.value = parseInt(this.dom.elements.year.value) + 1
        } else {
          this.dom.elements.month.value = v + 1
        }
        this.dateChange()
        break
      case 'day':
        let date = new Date(this.value())
        date = new Date(date.getTime() + 86400000)
        this.set(date)
    }
  }

  value () {
    const year = this.dom.elements.year.value
    const month = this.dom.elements.month.value
    const day = this.dom.elements.day.value

    if (!year || !month || !day) {
      return null
    }

    const v = sprintf('%04d-%02d-%02d', year, month, day)
    if (isNaN(new Date(v))) {
      return null
    }

    return v
  }

  set (date) {
    const d = new Date(date)

    this.dom.elements.year.value = d.getFullYear()
    this.dom.elements.month.value = d.getMonth() + 1
    this.dom.elements.day.value = d.getDate()

    this.dateChange()
  }
}

module.exports = new DateSelector()
