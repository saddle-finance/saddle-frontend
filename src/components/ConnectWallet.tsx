import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { Twemoji } from 'react-emoji-render'

import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'

import { connectMetamask } from '../actions'
import { State } from '../reducers'

interface Props {
  onPress: () => null,
  signer?: Signer,
  provider?: Provider,
  account?: string,
}
const _WalletStatus: React.FunctionComponent<Props> = ({ onPress, signer }) => {
  return <div className="walletStatus">
      <button className={classNames({ connection: true, success: !!signer })}
              type="button" onClick={onPress}>
        { signer && <Twemoji className="indicator" text=":red_circle:" /> }
        &nbsp;{ signer ? "Connected!" : "Connect Wallet" }
      </button>
  </div>
}

const mapDispatchToProps = (dispatch: (a: any) => null) => ({
  onPress: () => dispatch(connectMetamask()),
})

const mapStateToProps = (state: State) => state.wallet

const WalletStatus = connect(mapStateToProps, mapDispatchToProps)(_WalletStatus)

export default WalletStatus
