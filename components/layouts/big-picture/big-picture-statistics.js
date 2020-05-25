import React, {useContext, useState, useEffect, useCallback} from 'react'
import {BarChart2} from 'react-feather'
import Link from 'next/link'

import colors from '../../../styles/colors'

import {AppContext} from '../../../pages'

import {getPreviousReport, getReport} from '../../../lib/data'

import Counters from './big-picture-counters'
import MixedChart from '../../charts/mixed-chart'
import IndicateurCumulChart from '../../charts/indicateur-cumul'
import IndicateurVariationChart from '../../charts/indicateur-variation'

import {BigPictureContext} from '.'

const charts = {
  mixed: {
    name: 'Tout afficher',
    chart: MixedChart
  },
  confirmed: {
    name: 'Cas confirmés',
    type: 'indicateur',
    options: {
      label: 'Cas confirmés',
      metricName: 'casConfirmes',
      color: 'orange'
    }
  },
  hospitalises: {
    name: 'Hospitalisations',
    type: 'indicateur',
    options: {
      label: 'Hospitalisés',
      metricName: 'hospitalises',
      color: 'darkGrey'
    }
  },
  reanimation: {
    name: 'Réanimations',
    type: 'indicateur',
    options: {
      label: 'Réanimations',
      metricName: 'reanimation',
      color: 'darkerGrey'
    }
  },
  deces: {
    name: 'Décès à l’hôpital',
    type: 'indicateur',
    options: {
      label: 'Décès à l’hôpital',
      metricName: 'deces',
      color: 'red'
    }
  },
  gueris: {
    name: 'Retours à domicile',
    type: 'indicateur',
    options: {
      label: 'Retours à domicile',
      metricName: 'gueris',
      color: 'green'
    }
  },
  casEhpad: {
    name: 'Cas total',
    type: 'indicateur',
    options: {
      label: 'Cas total',
      metricName: 'casEhpad',
      color: 'orange'
    }
  },
  casConfirmesEhpad: {
    name: 'Cas confirmés',
    type: 'indicateur',
    options: {
      label: 'Cas confirmés',
      metricName: 'casConfirmesEhpad',
      color: 'darkOrange'
    }
  },
  decesEhpad: {
    name: 'Décès',
    type: 'indicateur',
    options: {
      label: 'Décès',
      metricName: 'decesEhpad',
      color: 'darkRed'
    }
  }
}

function getChart(chartName, showVariations) {
  if (chartName) {
    if (charts[chartName].chart) {
      return charts[chartName].chart
    }

    if (charts[chartName].type === 'indicateur') {
      return showVariations ? IndicateurVariationChart : IndicateurCumulChart
    }
  }
}

const BigPictureStatistics = () => {
  const {date, selectedLocation, isMobileDevice} = useContext(AppContext)

  const [report, setReport] = useState(null)
  const [previousReport, setPreviousReport] = useState(null)

  useEffect(() => {
    async function fetchReport() {
      setReport(await getReport(date, selectedLocation))
    }

    fetchReport()
  }, [date, selectedLocation])

  useEffect(() => {
    async function fetchPreviousReport() {
      setPreviousReport(await getPreviousReport(report))
    }

    if (report) {
      fetchPreviousReport()
    }
  }, [report])

  const {selectedStat, setSelectedStat} = useContext(BigPictureContext)
  const [showVariations, setShowVariations] = useState(false)

  const Chart = getChart(selectedStat, showVariations)

  useEffect(() => {
    setSelectedStat('mixed')
  }, [setSelectedStat])

  const toggleable = useCallback(chartName => {
    if (chartName) {
      return charts[selectedStat].type === 'indicateur'
    }

    return false
  }, [selectedStat])

  const chartOptions = useCallback(chartName => {
    if (chartName) {
      return charts[selectedStat].options || {}
    }
  }, [selectedStat])

  const isToggleable = toggleable(selectedStat)
  const selectedChartOptions = chartOptions(selectedStat)

  return (
    <>
      <div className='header'>
        {selectedLocation && !isMobileDevice && (
          <Link href='/'><div className='back'><BarChart2 /> <span>France</span></div></Link>
        )}
        <h3>COVID-19 - {report ? report.nom : 'France'}</h3>
      </div>

      {report && (
        <Counters report={report} previousReport={previousReport} />
      )}
      {report && report.history && selectedStat && (
        <>
          {isToggleable && <a className='toggle' onClick={() => setShowVariations(!showVariations)}>{showVariations ? 'Afficher les valeurs cumulées' : 'Afficher les variations quotidiennes'}</a>}
          <div className='chart-container'>
            <Chart reports={report.history.filter(r => date >= r.date)} {...selectedChartOptions} />
          </div>
          {selectedStat !== 'mixed' &&
            <div className='mixed-chart-container'>
              <div className='mixed-chart-button' onClick={() => setSelectedStat('mixed')}>Afficher le cumul</div>
            </div>}
        </>
      )}

      <style jsx>{`
        .header {
          z-index: 2;
          text-align: center;
          position: sticky;
          top: 0;
          background-color: white;
          padding: ${isMobileDevice ? '0.2em' : 0};
          box-shadow: 0 1px 4px ${colors.lightGrey};
        }

        .header h3 {
          margin: 0.4em;
        }

        .back {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          background: ${colors.lighterGrey};
          padding: 0.5em;
          font-size: larger;
        }

        .back span {
          margin: 0 0.5em;
        }

        .back:hover {
          cursor: pointer;
          background: ${colors.lightGrey};
        }

        .chart-container {
          margin: ${isMobileDevice ? '0 0.2em' : '0 1em'};
        }

        .toggle {
          padding: 2px 20px;
          text-align: right;
          font-size: 0.8em;
          cursor: pointer;
        }

        .mixed-chart-container {
          border-bottom: 1px solid ${colors.darkBlue};
          border-right: 1px solid ${colors.darkBlue};
          margin: ${isMobileDevice ? '0.5em 0.2em' : '0.5em 1em'};
        }

        .mixed-chart-button {
          display: block;
          font-weight: bold;
          height: 100%;
          text-align: center;
          background-color: ${colors.white};
          color: ${colors.darkBlue};
          padding: 0.4em;
          font-size: .7em;
          letter-spacing: .1em;
          border: 1px solid ${colors.darkBlue};
          text-transform: uppercase;
          transform: translate(-.1em, -.1em);
          transition: transform .1s ease-out;
        }

        .mixed-chart-button:hover {
          cursor: pointer;
          color: ${colors.white};
          background-color: ${colors.darkBlue};
          transform: translate(0px, 0px);
        }
        `}</style>
    </>
  )
}

export default BigPictureStatistics
