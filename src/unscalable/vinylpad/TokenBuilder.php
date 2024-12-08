<?php

namespace unscalable\vinylpad;

use DateTimeImmutable;
use DateTimeZone;
use Exception;
use Lcobucci\JWT\Encoding\ChainedFormatter;
use Lcobucci\JWT\Encoding\JoseEncoder;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Signer\Ecdsa\Sha256;
use Lcobucci\JWT\Token\Builder;
use Lcobucci\JWT\Token\Parser;

class TokenBuilder
{
    //https://developer.apple.com/documentation/applemusicapi/generating_developer_tokens
    //https://lcobucci-jwt.readthedocs.io/en/latest/issuing-tokens/
    private string $teamId;
    private string $keyId;
    private ?string $webAddress;
    private string $keyFile;
    public function __construct(string $teamId, string $keyId,?string $webAddress,string $keyFile)
    {
        $this->teamId = $teamId;
        $this->keyId = $keyId;
        $this->webAddress = $webAddress;
        $this->keyFile = $keyFile;
    }

    /**
     * @throws Exception
     */
    public function build():string
    {
        //https://lcobucci-jwt.readthedocs.io/en/latest/issuing-tokens/
        $tokenBuilder = (new Builder(new JoseEncoder(), ChainedFormatter::default()));
        $algorithm    = new Sha256();
        $signingKey   = InMemory::file($this->keyFile);
        $now=new DateTimeImmutable('now',new DateTimeZone('UTC'));

        $tokenBuilder=$tokenBuilder
            ->issuedBy($this->teamId)
            ->issuedAt($now)
            ->expiresAt($now->modify('+30 day'))
            ->withHeader('kid', $this->keyId);
        if($this->webAddress!==null){
            //restrict to this web address
            $tokenBuilder=$tokenBuilder->withClaim('origin', $this->webAddress);
        }

        return $tokenBuilder
            ->getToken($algorithm,$signingKey)
            ->toString();
    }

    public static function parse(string $token): string
    {
        $parser = new Parser(new JoseEncoder());
        $token=$parser->parse($token);
        return json_encode($token->headers()->all())." - ".json_encode($token->claims()->all());
    }
}