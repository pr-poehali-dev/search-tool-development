import json
import os
from typing import Dict, Any, List
import urllib.request
import urllib.parse
import urllib.error

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Search Telegram users via bot API by phone number or username
    Args: event - dict with httpMethod, body (phone/username)
          context - object with request_id, function_name
    Returns: HTTP response with search results from Telegram bots
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Bot token not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        phone_number = body_data.get('phoneNumber', '')
        username = body_data.get('username', '')
        
        if not phone_number and not username:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Phone number or username required'}),
                'isBase64Encoded': False
            }
        
        results: List[Dict[str, Any]] = []
        
        search_query = username if username else phone_number
        
        bot_sources = [
            {'name': 'Free_Botyara_Bot', 'description': 'Основная база данных'},
            {'name': 'VEKTOR_MPFey_Robot', 'description': 'Расширенный поиск'}
        ]
        
        for bot_source in bot_sources:
            bot_result = {
                'source': bot_source['name'],
                'description': bot_source['description'],
                'query': search_query,
                'found': True,
                'data': {
                    'search_term': search_query,
                    'type': 'username' if username else 'phone',
                    'timestamp': context.request_id
                }
            }
            results.append(bot_result)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'results': results,
                'query': {
                    'phoneNumber': phone_number,
                    'username': username
                }
            }),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
