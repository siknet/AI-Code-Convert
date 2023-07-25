import { CodeBlock } from '@/components/CodeBlock';
import { LanguageSelect,languages } from '@/components/LanguageSelect';
import { TextBlock } from '@/components/TextBlock';
import { TranslateBody } from '@/types/types';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [inputLanguage, setInputLanguage] = useState<string>('Natural Language');
  const [outputLanguage, setOutputLanguage] = useState<string>('Python');
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);

  const handleTranslate = async () => {
    const maxCodeLength = 16000;

    if (inputLanguage === outputLanguage) {
      alert('Please select different languages.');
      return;
    }

    if (!inputCode) {
      alert('Please enter some code.');
      return;
    }

    if (inputCode.length > maxCodeLength) {
      alert(
        `Please enter code less than ${maxCodeLength} characters. You are currently at ${inputCode.length} characters.`,
      );
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body: TranslateBody = {
      inputLanguage,
      outputLanguage,
      inputCode
    };

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let code = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      code += chunkValue;

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
    setHasTranslated(true);
    copyToClipboard(code);
  };

  const copyToClipboard = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  useEffect(() => {
	const isOutputLanguageInArray = languages.some(
	      (language) => language.value === outputLanguage
	);
    if (hasTranslated && isOutputLanguageInArray) {
      handleTranslate();
    }
  }, [outputLanguage]);

  return (
    <>
      <Head>
        <title>AI Code Converter</title>
        <meta name="description" content="Use AI to Convert or Generate Code from one language to another. AI Code Translator."/>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="keywords" content="AI Code Converter,Code Convert AI, Code Generate AI,Code Translator,AICodeHelper,free,online" />
		<link rel="canonical" href="https://aicodeconvert.com" />
        <link rel="icon" href="/code.png" />
      </Head>
	  
	  <div className="h-100 flex justify-start items-center pl-10 pt-5 bg-[#0E1117]">
	  	<img className="w-50 h-50" alt="AICodeConverter" src="code.png" />
	  	<h1 className="text-white font-bold text-2xl"><span className="text-blue-500 ml-2">AI</span>CodeConvert.com</h1>
	  </div>
	  
      <div className="flex h-full min-h-screen flex-col items-center bg-[#0E1117] px-4 pb-20 text-neutral-200 sm:px-10">
		<div className="mt-5 flex flex-col items-center justify-center sm:mt-10">
          <h1 className="text-4xl font-bold"><span className="text-blue-500">AI</span> Code Converter</h1>
		  <div className="mt-5 text-xl text-center leading-2">Generate <span className="text-blue-500 font-bold">Code</span> or <span className="text-blue-500 font-bold">Natural Language</span> To
		  <br /> Programming Language <span className="text-blue-500 font-bold">Code</span> of Selected</div>
        </div>
		
        <div className="mt-6 flex w-full max-w-[1200px] flex-col justify-between sm:flex-row sm:space-x-4">
          <div className="h-100 flex flex-col justify-center space-y-2 sm:w-2/4">
            <div className="text-center text-xl font-bold">From</div>

            <LanguageSelect
              language={inputLanguage}
              onChange={(value) => {
                setInputLanguage(value);
                setHasTranslated(false);
                // setInputCode('');
                // setOutputCode('');
              }}
            />

            {inputLanguage === 'Natural Language' ? (
              <TextBlock
                text={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                  setHasTranslated(false);
                }}
              />
            ) : (
              <CodeBlock
                code={inputCode}
                editable={!loading}
                onChange={(value) => {
                  setInputCode(value);
                  setHasTranslated(false);
                }}
              />
            )}
          </div>
          <div className="mt-8 flex h-full flex-col justify-center space-y-2 sm:mt-0 sm:w-2/4">
            <div className="text-center text-xl font-bold">TO</div>

            <LanguageSelect
              language={outputLanguage}
              onChange={(value) => {
                setOutputLanguage(value);
                setOutputCode('');
              }}
            />

            {outputLanguage === 'Natural Language' ? (
              <TextBlock text={outputCode} />
            ) : (
              <CodeBlock code={outputCode} />
            )}
          </div>
        </div>
		
		<div className="mt-5 text-center text-sm">
		  {loading
		    ? '...'// Generating
		    : hasTranslated
		    ? 'Output copied to clipboard!'
		    : 'Enter some code and click "Generate"'}
		</div>
		
		<div className="mt-5 flex items-center space-x-2">
		  <button
		    className="w-[140px] cursor-pointer rounded-md bg-blue-500 px-4 py-2 font-bold hover:bg-blue-600 active:bg-blue-700"
		    onClick={() => handleTranslate()}
		    disabled={loading}
		  >
		    {loading ? 'Generating...' : 'Generate'}
		  </button>
		</div>
	  </div>
    </>
  );
}
