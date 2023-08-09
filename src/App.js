import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  letter-spacing: 2px;
  font-family: "Lucida Console", "Courier New", monospace;
  border-radius: 50px;
  border: none;
  background: url("/config/images/square60.png");
  padding: 12px;
  font-weight: bold;
  font-size: 19px;
  color: var(--secondary-text);
  width: 200px;
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledButton2 = styled.button`
  background: url("/config/images/tw.png");
  cursor: pointer;
  border: none;
  width: 50px;
  height: 50px;
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  height: 70%;
  width: 70%;
`;

export const StyledLogo = styled.img`
  width: 300px;

  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  background-color: var(--accent);
  width: 20px;
  transition: width 0.5s;
  cursor: pointer;
`;

export const StyledImg2 = styled.img`
  
  background-color: var(--accent);
  width: 200px;
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Each Mutant Ape costs 99,999 $PLS`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

const Timer = ({ deadline = new Date().toString() }) => {
  const parsedDeadline = React.useMemo(() => Date.parse(deadline), [deadline]);
  const [time, setTime] = React.useState(parsedDeadline - Date.now());

  React.useEffect(() => {
    const interval = setInterval(
      () => setTime(parsedDeadline - Date.now()),
      
    );

    return () => clearInterval(interval);
  }, [parsedDeadline]);

  return (

      <s.timer>
      {Object.entries({
        Hours: (time / HOUR),
        Minutes: (time / MINUTE) % 60,
        Seconds: (time / SECOND) % 60
      }).map(([label, value]) => (

          <s.col3
          style={{
            marginLeft: "17px",
          }}>
            {`${Math.floor(value)}`.padStart(2, "0")}
          </s.col3>

      ))}
      </s.timer>

  );
};

  const claimNFTs = () => {
    let cost = 160000000000000000000001;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    let totalCostWeiNum = cost * mintAmount
    let trueCost = BigInt(totalCostWeiNum).toString();
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: trueCost,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Something went wrong. Try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `You have minted ${mintAmount} ${CONFIG.NFT_NAME}!`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  const handleTwitter = () => {
    window.open(
      'https://twitter.com/MutantPulseApes',
      '_blank' // <- This is what makes it open in a new window.
    );
  };

  const handleApply = () => {
    window.open(
      'https://forms.gle/LakgDPLabxcsnueA6',
      '_blank' // <- This is what makes it open in a new window.
    );
  };

  const handleALL = () => {
    window.open(
      'https://www.starslaunchpad.net'
    );
  };


  return (
    <s.Screen>
      
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 10, backgroundColor: "var(--primary)", }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >

<div class="container" style={{display:"flex", marginLeft:"55px"}}>

  <div class="card" style={{marginLeft:"0px"}} onClick={handleApply} target="_blank" rel="noopener noreferrer">

<ResponsiveWrapper test>
        <s.SpacerLarge />
        <s.Container
          flex={1}
          jc={"center"}
          ai={"center"}
          image={CONFIG.SHOW_BACKGROUND ? "/config/images/squareapply.png" : null}
          style={{
            padding: 30,
            paddingBottom: 10,
            paddingTop: 10,
            borderRadius: 20,
            boxShadow: "0px 2px 2px 5px rgba(0,0,0,0.2)",
            cursor:"pointer",
          }}
        >
          <s.TextTitle
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: "var(--accent-text)",
            }}
          >
            Apply
          </s.TextTitle>
        </s.Container>

      </ResponsiveWrapper>
  </div>

<div class="card" style={{marginLeft:"40px"}}>

<ResponsiveWrapper test>
        <s.SpacerLarge />
        <s.Container onClick={handleALL}
          flex={1}
          jc={"center"}
          ai={"center"}
          image={CONFIG.SHOW_BACKGROUND ? "/config/images/square3.png" : null}
          style={{
            padding: 30,
            paddingBottom: 10,
            paddingTop: 10,
            borderRadius: 20,
            boxShadow: "0px 2px 2px 5px rgba(0,0,0,0.2)",
            cursor:"pointer",
          }}
          
        >
          <s.TextTitle
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: "var(--accent-text)",
            }}
          >
            ALL
          </s.TextTitle>
        </s.Container>

      </ResponsiveWrapper>
  </div>

  

  <div class="card" style={{marginLeft:"-20px"}}>

<ResponsiveWrapper test>
        <s.SpacerLarge />
        <s.Container
          flex={1}
          jc={"center"}
          ai={"center"}
          image={CONFIG.SHOW_BACKGROUND ? "/config/images/square3.png" : null}
          style={{
            padding: 30,
            paddingBottom: 10,
            paddingTop: 10,
            borderRadius: 20,
            boxShadow: "0px 2px 2px 5px rgba(0,0,0,0.2)",
            cursor:"pointer",
          }}
        >
          <s.TextTitle
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: "var(--accent-text)",
            }}
          >
            Live
          </s.TextTitle>
        </s.Container>

      </ResponsiveWrapper>
  </div>

  <div class="card" style={{marginLeft:"-20px"}}>

<ResponsiveWrapper test>
        <s.SpacerLarge />
        <s.Container
          flex={1}
          jc={"center"}
          ai={"center"}
          image={CONFIG.SHOW_BACKGROUND ? "/config/images/square3.png" : null}
          style={{
            padding: 30,
            paddingBottom: 10,
            paddingTop: 10,
            paddingLeft: 42,
            paddingRight: 42,
            borderRadius: 20,
            boxShadow: "0px 2px 2px 5px rgba(0,0,0,0.2)",
            cursor:"pointer",
          }}
        >
          <s.TextTitle
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: "var(--accent-text)",
            }}
          >
            Upcoming
          </s.TextTitle>
        </s.Container>

      </ResponsiveWrapper>
  </div>

  <div class="card" style={{marginLeft:"20px"}}>

<ResponsiveWrapper test>
        <s.SpacerLarge />
        <s.Container
          flex={1}
          jc={"center"}
          ai={"center"}
          image={CONFIG.SHOW_BACKGROUND ? "/config/images/squarered.png" : null}
          style={{
            padding: 30,
            paddingBottom: 10,
            paddingTop: 10,
            paddingRight: 35,
            paddingLeft: 35,
            borderRadius: 20,
            boxShadow: "0px 2px 2px 5px rgba(0,0,0,0.2)",
            cursor:"pointer",
          }}
        >
          <s.TextTitle
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: "var(--accent-text)",
            }}
          >
            Finished
          </s.TextTitle>
        </s.Container>

      </ResponsiveWrapper>
  </div>
  
  </div>






<s.SpacerSmall />
<s.TextTitle
            style={{
              textAlign:"right",
              fontSize: 50,
              fontWeight: "bold",
              color: "var(--accent-text)",
            }}
          >
            STARS Launchpad
          </s.TextTitle>
<div class="container" style={{display:"flex"}}>




  <div class="card" style={{marginLeft:"500px", marginRight:"100px", color: "#fff0",
            textShadowColor: "rgba(255,255,255,0.8)",
            textShadowOffset: {
              width: 0,
              height: 0,
            },
            textShadowRadius: 10,
            fontSize: 14,
            fontWeight: "600"}}>

<ResponsiveWrapper test>
        <s.SpacerLarge />
        <s.Container
          flex={1}
          jc={"center"}
          ai={"center"}
          image={CONFIG.SHOW_BACKGROUND ? "/config/images/menuprincipal.png" : null}
          style={{
            padding: 10,
            paddingLeft: 25,
            paddingRight: 25,
            borderRadius: 60,
            boxShadow: "0px 5px 15px 15px rgba(1,1,0,0.5)",
          
          }}
          
        ><s.SpacerLarge />
        <s.SpacerLarge />
          <s.SpacerLarge />
           <s.SpacerLarge />
           <s.SpacerLarge />
           <s.SpacerLarge />
           <s.SpacerLarge />
           <s.SpacerLarge />
           <s.SpacerLarge />
           <s.SpacerLarge />
           <s.SpacerLarge />
           <s.SpacerLarge />
          <s.TextTitle
            style={{
              textAlign: "center",
              fontSize: 50,
              letterSpacing: 6,
              fontWeight: "bold",
              color: "var(--accent-text)",
            }}
          >
          Mutant Ape AntiDan Club
          </s.TextTitle>

          <div class="card">

          <ResponsiveWrapper test>
          <div class="container" style={{display:"flex"} }>


<div class="card">
        <s.Container
          flex={1}
          jc={"center"}
          ai={"center"}
          image={CONFIG.SHOW_BACKGROUND ? "/config/images/square90.png" : null}
          style={{
            padding: 20,
            paddingBottom: 13,
            paddingRight: 20,
            paddingLeft: 20,
            paddingTop: 13,
            borderRadius: 25,
          
          }}
        >
          
          <StyledImg
              alt={"logo"}
              src={"/config/images/web.png"}
            />
        </s.Container>

        </div>
        <div class="card" onClick={handleTwitter} target="_blank" rel="noopener noreferrer" style={{marginLeft:"20px"}}>
        <s.Container
          flex={1}
          jc={"center"}
          ai={"center"}
          image={CONFIG.SHOW_BACKGROUND ? "/config/images/square90.png" : null}
          style={{
            padding: 20,
            paddingBottom: 13,
            paddingRight: 20,
            paddingLeft: 20,
            paddingTop: 13,
            borderRadius: 25,
          
          }}
        >
          
          <StyledImg
              alt={"logo"}
              src={"/config/images/tw.png"}
            />
        </s.Container>
        </div>
        <div class="card"style={{marginLeft:"20px"}}>
        <s.Container
          flex={1}
          jc={"center"}
          ai={"center"}
          image={CONFIG.SHOW_BACKGROUND ? "/config/images/square90.png" : null}
          style={{
            padding: 20,
            paddingBottom: 13,
            paddingRight: 20,
            paddingLeft: 20,
            paddingTop: 13,
            borderRadius: 25,
          
          }}
        >
          
          <StyledImg
              alt={"logo"}
              src={"/config/images/tg.png"}
            />
        </s.Container>
        </div>
        <div class="card"style={{marginLeft:"20px"}}>
        <s.Container
          flex={1}
          jc={"center"}
          ai={"center"}
          image={CONFIG.SHOW_BACKGROUND ? "/config/images/square90.png" : null}
          style={{
            padding: 20,
            paddingBottom: 13,
            paddingRight: 20,
            paddingLeft: 20,
            paddingTop: 13,
            borderRadius: 25,
          
          }}
        >
          
          <StyledImg
              alt={"logo"}
              src={"/config/images/info.png"}
            />
        </s.Container>

        </div>
        </div>
      </ResponsiveWrapper>
  </div>
  <s.SpacerXSmall />
          <s.TextDescription
            style={{
              fontSize: 20,
              color: "var(--secondary-text)",
            }}
          >
            The MUTANT APE ANTIDAN CLUB is a collection of 999 Mutant Apes landing on PulseChain to give hand to the Ape community. 95% of the funds from this project will be used to generate a staking system that will reward $PLS for each staked Mutant. The first phase can only be minted by the holders of a PAYC nft. 
            </s.TextDescription>
          <s.SpacerMedium />
          <StyledButton
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(connect());
                      getData();
                    }}
                  >
                    STARTS IN
                  </StyledButton>
                  <s.SpacerMedium />
                  <s.TextSubTitle
            style={{
              fontSize: 30,
              color: "var(--accent-text)",
            }}
          >
            <Timer deadline="August, 11, 2023"/>
          </s.TextSubTitle>
          
          <s.SpacerMedium />
         
        </s.Container>

      </ResponsiveWrapper>
  </div>


  
</div>
  
        <s.SpacerSmall />
        <s.SpacerMedium />
      </s.Container>

      
    </s.Screen>
  );
}

export default App;
